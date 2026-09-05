import AsyncStorage from '@react-native-async-storage/async-storage';

// Force les écritures à se dérouler une par une, dans l'ordre d'appel,
// plutôt qu'en parallèle — évite qu'une écriture plus ancienne mais plus
// lente n'écrase une écriture plus récente arrivée entre-temps.
let writeQueue = Promise.resolve();

function queuedSetItem(key, value) {
  writeQueue = writeQueue.then(() => AsyncStorage.setItem(key, value));
  return writeQueue;
}

const safeStorage = {
  setItem: queuedSetItem,
  getItem: (key) => AsyncStorage.getItem(key),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

export default safeStorage;