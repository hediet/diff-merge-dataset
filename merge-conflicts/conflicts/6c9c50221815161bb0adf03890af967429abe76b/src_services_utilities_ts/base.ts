// These utilities are common to multiple language service features.
module ts {
    export interface ListItemInfo {
        listItemIndex: number;
        list: Node;
    }

    export function findListItemInfo(node: Node): ListItemInfo {
        var syntaxList = findContainingList(node);
        var children = syntaxList.getChildren();
        var index = indexOf(children, node);

        return {
            listItemIndex: index,
            list: syntaxList
        };
    }

    export function findChildOfKind(n: Node, kind: SyntaxKind, sourceFile?: SourceFile): Node {
        return forEach(n.getChildren(sourceFile), c => c.kind === kind && c);
    }

    export function findContainingList(node: Node): Node {
        // The node might be a list element (nonsynthetic) or a comma (synthetic). Either way, it will
        // be parented by the container of the SyntaxList, not the SyntaxList itself.
        // In order to find the list item index, we first need to locate SyntaxList itself and then search
        // for the position of the relevant node (or comma).
        var syntaxList = forEach(node.parent.getChildren(), c => {
            // find syntax list that covers the span of the node
            if (c.kind === SyntaxKind.SyntaxList && c.pos <= node.pos && c.end >= node.end) {
                return c;
            }
        });

        // syntaxList should not be undefined here. If it is, there is a problem. Find out if
        // there at least is a child that is a list.
        if (!syntaxList) {
            Debug.assert(findChildOfKind(node.parent, SyntaxKind.SyntaxList),
                "Node of kind " + SyntaxKind[node.parent.kind] + " has no list children");
        }

        return syntaxList;
    }

    /**
     * Includes the start position of each child, but excludes the end.
     */
    export function findListItemIndexContainingPosition(list: Node, position: number): number {
        Debug.assert(list.kind === SyntaxKind.SyntaxList);
        var children = list.getChildren();
        for (var i = 0; i < children.length; i++) {
            if (children[i].pos <= position && children[i].end > position) {
                return i;
            }
        }

        return -1;
    }

    /* Gets the token whose text has range [start, end) and 
     * position >= start and (position < end or (position === end && token is keyword or identifier))
     */
    export function getTouchingWord(sourceFile: SourceFile, position: number): Node {
        return getTouchingToken(sourceFile, position, isWord);
    }

    /* Gets the token whose text has range [start, end) and position >= start 
     * and (position < end or (position === end && token is keyword or identifier or numeric\string litera))
     */
    export function getTouchingPropertyName(sourceFile: SourceFile, position: number): Node {
        return getTouchingToken(sourceFile, position, isPropertyName);
    }

    /** Returns the token if position is in [start, end) or if position === end and includeItemAtEndPosition(token) === true */
    export function getTouchingToken(sourceFile: SourceFile, position: number, includeItemAtEndPosition?: (n: Node) => boolean): Node {
        return getTokenAtPositionWorker(sourceFile, position, /*allowPositionInLeadingTrivia*/ false, includeItemAtEndPosition);
    }

    /** Returns a token if position is in [start-of-leading-trivia, end) */
    export function getTokenAtPosition(sourceFile: SourceFile, position: number): Node {
        return getTokenAtPositionWorker(sourceFile, position, /*allowPositionInLeadingTrivia*/ true, /*includeItemAtEndPosition*/ undefined);
    }

    /** Get the token whose text contains the position */
    function getTokenAtPositionWorker(sourceFile: SourceFile, position: number, allowPositionInLeadingTrivia: boolean, includeItemAtEndPosition: (n: Node) => boolean): Node {
        var current: Node = sourceFile;
        outer: while (true) {
            if (isToken(current)) {
                // exit early
                return current;
            }

            // find the child that contains 'position'
            for (var i = 0, n = current.getChildCount(sourceFile); i < n; i++) {
                var child = current.getChildAt(i);
                var start = allowPositionInLeadingTrivia ? child.getFullStart() : child.getStart(sourceFile);
                if (start <= position) {
                    if (position < child.getEnd()) {
                        current = child;
                        continue outer;
                    }
                    else if (includeItemAtEndPosition && child.getEnd() === position) {
                        var previousToken = findPrecedingToken(position, sourceFile, child);
                        if (previousToken && includeItemAtEndPosition(previousToken)) {
                            return previousToken;
                        }
                    }
                }
            }
            return current;
        }
    }

    /**
      * The token on the left of the position is the token that strictly includes the position
      * or sits to the left of the cursor if it is on a boundary. For example
      *
      *   fo|o               -> will return foo
      *   foo <comment> |bar -> will return foo
      *
      */
    export function findTokenOnLeftOfPosition(file: SourceFile, position: number): Node {
        // Ideally, getTokenAtPosition should return a token. However, it is currently
        // broken, so we do a check to make sure the result was indeed a token.
        var tokenAtPosition = getTokenAtPosition(file, position);
        if (isToken(tokenAtPosition) && position > tokenAtPosition.getStart(file) && position < tokenAtPosition.getEnd()) {
            return tokenAtPosition;
        }

        return findPrecedingToken(position, file);
    }

    export function findNextToken(previousToken: Node, parent: Node): Node {
        return find(parent);

        function find(n: Node): Node {
            if (isToken(n) && n.pos === previousToken.end) {
                // this is token that starts at the end of previous token - return it
                return n;
            }

            var children = n.getChildren();
            for (var i = 0, len = children.length; i < len; ++i) {
                var child = children[i];
                var shouldDiveInChildNode =
                    // previous token is enclosed somewhere in the child
                    (child.pos <= previousToken.pos && child.end > previousToken.end) ||
                    // previous token ends exactly at the beginning of child
                    (child.pos === previousToken.end);

                if (shouldDiveInChildNode && nodeHasTokens(child)) {
                    return find(child);
                }
            }

            return undefined;
        }
    }

    export function findPrecedingToken(position: number, sourceFile: SourceFile, startNode?: Node): Node {
        return find(startNode || sourceFile);

        function findRightmostToken(n: Node): Node {
            if (isToken(n)) {
                return n;
            }

            var children = n.getChildren();
            var candidate = findRightmostChildNodeWithTokens(children, /*exclusiveStartPosition*/ children.length);
            return candidate && findRightmostToken(candidate);

        }

        function find(n: Node): Node {
            if (isToken(n)) {
                return n;
            }

            var children = n.getChildren();
            for (var i = 0, len = children.length; i < len; ++i) {
                var child = children[i];
                if (nodeHasTokens(child)) {
                    if (position < child.end) {
                        if (child.getStart(sourceFile) >= position) {
                            // actual start of the node is past the position - previous token should be at the end of previous child
                            var candidate = findRightmostChildNodeWithTokens(children, /*exclusiveStartPosition*/ i);
                            return candidate && findRightmostToken(candidate)
                        }
                        else {
                            // candidate should be in this node
                            return find(child);
                        }
                    }
                }
            }

            Debug.assert(startNode || n.kind === SyntaxKind.SourceFile);

            // Here we know that none of child token nodes embrace the position, 
            // the only known case is when position is at the end of the file.
            // Try to find the rightmost token in the file without filtering.
            // Namely we are skipping the check: 'position < node.end'
            if (children.length) {
                var candidate = findRightmostChildNodeWithTokens(children, /*exclusiveStartPosition*/ children.length);
                return candidate && findRightmostToken(candidate);
            }
        }

        /// finds last node that is considered as candidate for search (isCandidate(node) === true) starting from 'exclusiveStartPosition'
        function findRightmostChildNodeWithTokens(children: Node[], exclusiveStartPosition: number): Node {
            for (var i = exclusiveStartPosition - 1; i >= 0; --i) {
                if (nodeHasTokens(children[i])) {
                    return children[i];
                }
            }
        }
    }

    function nodeHasTokens(n: Node): boolean {
        if (n.kind === SyntaxKind.ExpressionStatement) {
            return nodeHasTokens((<ExpressionStatement>n).expression);
        }

        if (n.kind === SyntaxKind.EndOfFileToken || n.kind === SyntaxKind.OmittedExpression || n.kind === SyntaxKind.Missing) {
            return false;
        }

        // SyntaxList is already realized so getChildCount should be fast and non-expensive
        return n.kind !== SyntaxKind.SyntaxList || n.getChildCount() !== 0;
    }

    export function isToken(n: Node): boolean {
        return n.kind >= SyntaxKind.FirstToken && n.kind <= SyntaxKind.LastToken;
    }

    function isKeyword(n: Node): boolean {
        return n.kind >= SyntaxKind.FirstKeyword && n.kind <= SyntaxKind.LastKeyword;
    }

    function isWord(n: Node): boolean {
        return n.kind === SyntaxKind.Identifier || isKeyword(n);
    }

    function isPropertyName(n: Node): boolean {
        return n.kind === SyntaxKind.StringLiteral || n.kind === SyntaxKind.NumericLiteral || isWord(n);
    }
}