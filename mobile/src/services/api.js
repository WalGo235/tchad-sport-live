import { supabase } from '../config/supabase';

export const apiService = {
  async getTeams() {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) throw error;
    return data;
  },

  async getTeamById(id) {
    const { data, error } = await supabase.from('teams').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(name, logo_url), away_team:teams!away_team_id(name, logo_url), competition:competitions(name)')
      .order('match_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMatchById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(name, logo_url), away_team:teams!away_team_id(name, logo_url), competition:competitions(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getPlayers(teamId = null) {
    let query = supabase.from('players').select('*');
    if (teamId) query = query.eq('team_id', teamId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getNews() {
    const { data, error } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getArticleById(id) {
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getStandings() {
    const { data, error } = await supabase
      .from('standings')
      .select('*, teams(name, logo_url)')
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getComments(targetType, targetId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async postComment(targetType, targetId, content) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Connecte-toi pour commenter.');
    const authorName = user.email ? user.email.split('@')[0] : 'Utilisateur';
    const { data, error } = await supabase
      .from('comments')
      .insert({
        target_type: targetType,
        target_id: targetId,
        author_id: user.id,
        author_name: authorName,
        content,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
  },

  async getForumTopics() {
    const { data, error } = await supabase.from('forum_topics').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getForumTopicById(id) {
    const { data, error } = await supabase.from('forum_topics').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async postForumTopic(title, content) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Connecte-toi pour publier un sujet.');
    const authorName = user.email ? user.email.split('@')[0] : 'Utilisateur';
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({ author_id: user.id, author_name: authorName, title, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getForumReplies(topicId) {
    const { data, error } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async postForumReply(topicId, content) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Connecte-toi pour répondre.');
    const authorName = user.email ? user.email.split('@')[0] : 'Utilisateur';
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({ topic_id: topicId, author_id: user.id, author_name: authorName, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLikesForTargets(targetType, targetIds) {
    if (!targetIds.length) return [];
    const { data, error } = await supabase
      .from('forum_likes')
      .select('*')
      .eq('target_type', targetType)
      .in('target_id', targetIds);
    if (error) throw error;
    return data;
  },

  async toggleLike(targetType, targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Connecte-toi pour aimer.');
    const { data: existing, error: fetchError } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (fetchError) throw fetchError;

    if (existing) {
      const { error } = await supabase.from('forum_likes').delete().eq('id', existing.id);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('forum_likes')
        .insert({ target_type: targetType, target_id: targetId, user_id: user.id });
      if (error) throw error;
      return true;
    }
  },

  async registerPushToken(token) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        { token, user_id: user?.id ?? null, updated_at: new Date().toISOString() },
        { onConflict: 'token' }
      );
    if (error) throw error;
  },

  async deletePushToken(token) {
    const { error } = await supabase.from('push_tokens').delete().eq('token', token);
    if (error) throw error;
  },
};