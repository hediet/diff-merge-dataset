// [10 lines, 5 cols] + [ 0 lines, 3 cols] = [10 lines, 8 cols]
// [10 lines, 5 cols] + [20 lines, 3 cols] = [30 lines, 3 cols]
export function lengthAdd(length1: Length, length2: Length): Length;
export function lengthAdd(l1: any, l2: any): Length {
	let r = l1 + l2;
	if (l2 >= factor) { r = r - (l1 % factor); }
	return r;
}

export function sumLengths<T>(items: readonly T[], lengthFn: (item: T) => Length): Length {
	return items.reduce((a, b) => lengthAdd(a, lengthFn(b)), lengthZero);
}

export function lengthEquals(length1: Length, length2: Length): boolean {
	return length1 === length2;
}
