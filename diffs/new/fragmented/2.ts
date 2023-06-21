// [10 lines, 5 cols] + [ 0 lines, 3 cols] = [10 lines, 8 cols]
// [10 lines, 5 cols] + [20 lines, 3 cols] = [30 lines, 3 cols]
export function lengthAdd(length1: Length, length2: Length): Length;
export function lengthAdd(l1: any, l2: any): Length {
	return ((l2 < factor)
		? (l1 + l2) // l2 is the amount of columns (zero line count). Keep the column count from l1.
		: (l1 - (l1 % factor) + l2)); // l1 - (l1 % factor) equals toLength(l1.lineCount, 0)
}