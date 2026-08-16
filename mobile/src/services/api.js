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
      .select('*, home_team:teams!home_team_id(name, logo_url), away_team:teams!away_team_id(name, logo_url)')
      .order('match_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMatchById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(name, logo_url), away_team:teams!away_team_id(name, logo_url)')
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

  async getStandings() {
    const { data, error } = await supabase
      .from('standings')
      .select('*, teams(name, logo_url)')
      .order('points', { ascending: false });
    if (error) throw error;
    return data;
  },
};
