export function getStore<T>(getSnapshot: () => T): StoreInterface<T> {
	const suscribers = new Set<() => void>();

	return {
		subscribe: (callback: () => void) => {
			suscribers.add(callback);
			return () => {
				suscribers.delete(callback);
			};
		},
		getSnapshot: getSnapshot,
		notify: () => {
			suscribers.forEach((callback) => callback());
		}
	};
}
export interface StoreInterface<T> {
	/**
	 * @returns The current state of the store.
	 */
	getSnapshot: () => Readonly<T>;

	/**
	 * @param callback - The callback to be called when the store changes. 
	 * @returns A function to unsubscribe from the store.
	 */
	subscribe: (callback: VoidFunction) => VoidFunction;

	/**
	 * @param callback - The callback to be called when the store changes. 
	 */
	notify: VoidFunction;
}

export function getMapStore<K, V>(initialValue: Map<K, V>): MapStore<K, V> {
	let map = initialValue;
	let lastKeys = Array.from(initialValue.keys());
	let lastValues = Array.from(initialValue.values());

	const store = getStore(() => map);

	let lastMap = initialValue;
	function updateCacheSnapshot() {
		lastMap = store.getSnapshot();
		lastKeys = Array.from(store.getSnapshot().keys());
		lastValues = Array.from(store.getSnapshot().values());
		console.log("Updating cache snapshot", map, lastKeys, lastValues);

	}

	return {
		...store,
		set: (key: K, value: V) => {
			map = new Map(store.getSnapshot().entries());
			map.set(key, value);
			store.notify();
		},
		delete: (key: K) => {
			map = new Map(store.getSnapshot().entries());
			map.delete(key);
			store.notify();
		},

		get(key: K): V | undefined {
			return store.getSnapshot().get(key);
		},

		values: () => {
			if (!Object.is(map, lastMap)) updateCacheSnapshot();
			if (lastValues == undefined) throw new Error("lastValues is undefined");
			return lastValues;
		},

		keys: () => {
			if (!Object.is(map, lastMap)) updateCacheSnapshot();
			if (lastKeys == undefined) throw new Error("lastKeys is undefined");
			return lastKeys;
		},

		setMap: (newMap: Map<K, V>) => {
			map = newMap;
			store.notify();
		}
	};
}

export interface MapStore<K, V> extends StoreInterface<Map<K, V>> {
	/**
	 * @param key - The key to be added to the store.
	 * @param value - The value to be added to the store.
	 */
	set: (key: K, value: V) => void;

	/**
	 * @param key - The key to be removed from the store.
	 */
	delete: (key: K) => void;

	/**
	 * @param key - The key to be retrieved from the store.
	 * @returns The value of the key in the store.
	 */
	get: (key: K) => V | undefined;

	/**
	 * @returns The values of the store.
	 */
	values: () => V[];

	/**
	 * @returns The keys of the store as an array.
	 */
	keys: () => K[];

	/**
	 * @param newMap - The new map to be set in the store.
	 */
	setMap: (newMap: Map<K, V>) => void;
}


/**
 * A function that takes no arguments and returns nothing.
 */
type VoidFunction = () => void;	