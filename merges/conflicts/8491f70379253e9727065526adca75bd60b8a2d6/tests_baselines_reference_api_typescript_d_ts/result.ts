declare namespace ts {
    const versionMajorMinor = "3.0";
    /** The version of the TypeScript compiler release */
    const version: string;
}
declare namespace ts {
    /**
     * Type of objects whose values are all of the same type.
     * The `in` and `for-in` operators can *not* be safely used,
     * since `Object.prototype` may be modified by outside code.
     */
    interface MapLike<T> {
        [index: string]: T;
    }
    interface SortedArray<T> extends Array<T> {
        " __sortedArrayBrand": any;
    }
    /** ES6 Map interface, only read methods included. */
    interface ReadonlyMap<T> {
        get(key: string): T | undefined;
        has(key: string): boolean;
        forEach(action: (value: T, key: string) => void): void;
        readonly size: number;
        keys(): Iterator<string>;
        values(): Iterator<T>;
        entries(): Iterator<[string, T]>;
    }
    /** ES6 Map interface. */
    interface Map<T> extends ReadonlyMap<T> {
        set(key: string, value: T): this;
        delete(key: string): boolean;
        clear(): void;
    }
    /** ES6 Iterator type. */
    interface Iterator<T> {
        next(): {
            value: T;
            done: false;
        } | {
            value: never;
            done: true;
        };
    }
    /** Array that is only intended to be pushed to, never read. */
    interface Push<T> {
        push(...values: T[]): void;
    }
}
declare namespace ts {
    type Path = string & {
        __pathBrand: any;
    };
    interface TextRange {
        pos: number;
        end: number;
    }
    type JsDocSyntaxKind = SyntaxKind.EndOfFileToken | SyntaxKind.WhitespaceTrivia | SyntaxKind.AtToken | SyntaxKind.NewLineTrivia | SyntaxKind.AsteriskToken | SyntaxKind.OpenBraceToken | SyntaxKind.CloseBraceToken | SyntaxKind.LessThanToken | SyntaxKind.OpenBracketToken | SyntaxKind.CloseBracketToken | SyntaxKind.EqualsToken | SyntaxKind.CommaToken | SyntaxKind.DotToken | SyntaxKind.Identifier | SyntaxKind.NoSubstitutionTemplateLiteral | SyntaxKind.Unknown;
    type JsxTokenSyntaxKind = SyntaxKind.LessThanSlashToken | SyntaxKind.EndOfFileToken | SyntaxKind.ConflictMarkerTrivia | SyntaxKind.JsxText | SyntaxKind.JsxTextAllWhiteSpaces | SyntaxKind.OpenBraceToken | SyntaxKind.LessThanToken;
    enum SyntaxKind {
        Unknown = 0,
        EndOfFileToken = 1,
        SingleLineCommentTrivia = 2,
        MultiLineCommentTrivia = 3,
        NewLineTrivia = 4,
        WhitespaceTrivia = 5,
        ShebangTrivia = 6,
        ConflictMarkerTrivia = 7,
        NumericLiteral = 8,
        StringLiteral = 9,
        JsxText = 10,
        JsxTextAllWhiteSpaces = 11,
        RegularExpressionLiteral = 12,
        NoSubstitutionTemplateLiteral = 13,
        TemplateHead = 14,
        TemplateMiddle = 15,
        TemplateTail = 16,
        OpenBraceToken = 17,
        CloseBraceToken = 18,
        OpenParenToken = 19,
        CloseParenToken = 20,
        OpenBracketToken = 21,
        CloseBracketToken = 22,
        DotToken = 23,
        DotDotDotToken = 24,
        SemicolonToken = 25,
        CommaToken = 26,
        LessThanToken = 27,
        LessThanSlashToken = 28,
        GreaterThanToken = 29,
        LessThanEqualsToken = 30,
        GreaterThanEqualsToken = 31,
        EqualsEqualsToken = 32,
        ExclamationEqualsToken = 33,
        EqualsEqualsEqualsToken = 34,
        ExclamationEqualsEqualsToken = 35,
        EqualsGreaterThanToken = 36,
        PlusToken = 37,
        MinusToken = 38,
        AsteriskToken = 39,
        AsteriskAsteriskToken = 40,
        SlashToken = 41,
        PercentToken = 42,
        PlusPlusToken = 43,
        MinusMinusToken = 44,
        LessThanLessThanToken = 45,
        GreaterThanGreaterThanToken = 46,
        GreaterThanGreaterThanGreaterThanToken = 47,
        AmpersandToken = 48,
        BarToken = 49,
        CaretToken = 50,
        ExclamationToken = 51,
        TildeToken = 52,
        AmpersandAmpersandToken = 53,
        BarBarToken = 54,
        QuestionToken = 55,
        ColonToken = 56,
        AtToken = 57,
        EqualsToken = 58,
        PlusEqualsToken = 59,
        MinusEqualsToken = 60,
        AsteriskEqualsToken = 61,
        AsteriskAsteriskEqualsToken = 62,
        SlashEqualsToken = 63,
        PercentEqualsToken = 64,
        LessThanLessThanEqualsToken = 65,
        GreaterThanGreaterThanEqualsToken = 66,
        GreaterThanGreaterThanGreaterThanEqualsToken = 67,
        AmpersandEqualsToken = 68,
        BarEqualsToken = 69,
        CaretEqualsToken = 70,
        Identifier = 71,
        BreakKeyword = 72,
        CaseKeyword = 73,
        CatchKeyword = 74,
        ClassKeyword = 75,
        ConstKeyword = 76,
        ContinueKeyword = 77,
        DebuggerKeyword = 78,
        DefaultKeyword = 79,
        DeleteKeyword = 80,
        DoKeyword = 81,
        ElseKeyword = 82,
        EnumKeyword = 83,
        ExportKeyword = 84,
        ExtendsKeyword = 85,
        FalseKeyword = 86,
        FinallyKeyword = 87,
        ForKeyword = 88,
        FunctionKeyword = 89,
        IfKeyword = 90,
        ImportKeyword = 91,
        InKeyword = 92,
        InstanceOfKeyword = 93,
        NewKeyword = 94,
        NullKeyword = 95,
        ReturnKeyword = 96,
        SuperKeyword = 97,
        SwitchKeyword = 98,
        ThisKeyword = 99,
        ThrowKeyword = 100,
        TrueKeyword = 101,
        TryKeyword = 102,
        TypeOfKeyword = 103,
        VarKeyword = 104,
        VoidKeyword = 105,
        WhileKeyword = 106,
        WithKeyword = 107,
        ImplementsKeyword = 108,
        InterfaceKeyword = 109,
        LetKeyword = 110,
        PackageKeyword = 111,
        PrivateKeyword = 112,
        ProtectedKeyword = 113,
        PublicKeyword = 114,
        StaticKeyword = 115,
        YieldKeyword = 116,
        AbstractKeyword = 117,
        AsKeyword = 118,
        AnyKeyword = 119,
        AsyncKeyword = 120,
        AwaitKeyword = 121,
        BooleanKeyword = 122,
        ConstructorKeyword = 123,
        DeclareKeyword = 124,
        GetKeyword = 125,
        InferKeyword = 126,
        IsKeyword = 127,
        KeyOfKeyword = 128,
        ModuleKeyword = 129,
        NamespaceKeyword = 130,
        NeverKeyword = 131,
        ReadonlyKeyword = 132,
        RequireKeyword = 133,
        NumberKeyword = 134,
        ObjectKeyword = 135,
        SetKeyword = 136,
        StringKeyword = 137,
        SymbolKeyword = 138,
        TypeKeyword = 139,
        UndefinedKeyword = 140,
        UniqueKeyword = 141,
        UnknownKeyword = 142,
        FromKeyword = 143,
        GlobalKeyword = 144,
        OfKeyword = 145,
        QualifiedName = 146,
        ComputedPropertyName = 147,
        TypeParameter = 148,
        Parameter = 149,
        Decorator = 150,
        PropertySignature = 151,
        PropertyDeclaration = 152,
        MethodSignature = 153,
        MethodDeclaration = 154,
        Constructor = 155,
        GetAccessor = 156,
        SetAccessor = 157,
        CallSignature = 158,
        ConstructSignature = 159,
        IndexSignature = 160,
        TypePredicate = 161,
        TypeReference = 162,
        FunctionType = 163,
        ConstructorType = 164,
        TypeQuery = 165,
        TypeLiteral = 166,
        ArrayType = 167,
        TupleType = 168,
        UnionType = 169,
        IntersectionType = 170,
        ConditionalType = 171,
        InferType = 172,
        ParenthesizedType = 173,
        ThisType = 174,
        TypeOperator = 175,
        IndexedAccessType = 176,
        MappedType = 177,
        LiteralType = 178,
        ImportType = 179,
        ObjectBindingPattern = 180,
        ArrayBindingPattern = 181,
        BindingElement = 182,
        ArrayLiteralExpression = 183,
        ObjectLiteralExpression = 184,
        PropertyAccessExpression = 185,
        ElementAccessExpression = 186,
        CallExpression = 187,
        NewExpression = 188,
        TaggedTemplateExpression = 189,
        TypeAssertionExpression = 190,
        ParenthesizedExpression = 191,
        FunctionExpression = 192,
        ArrowFunction = 193,
        DeleteExpression = 194,
        TypeOfExpression = 195,
        VoidExpression = 196,
        AwaitExpression = 197,
        PrefixUnaryExpression = 198,
        PostfixUnaryExpression = 199,
        BinaryExpression = 200,
        ConditionalExpression = 201,
        TemplateExpression = 202,
        YieldExpression = 203,
        SpreadElement = 204,
        ClassExpression = 205,
        OmittedExpression = 206,
        ExpressionWithTypeArguments = 207,
        AsExpression = 208,
        NonNullExpression = 209,
        MetaProperty = 210,
        TemplateSpan = 211,
        SemicolonClassElement = 212,
        Block = 213,
        VariableStatement = 214,
        EmptyStatement = 215,
        ExpressionStatement = 216,
        IfStatement = 217,
        DoStatement = 218,
        WhileStatement = 219,
        ForStatement = 220,
        ForInStatement = 221,
        ForOfStatement = 222,
        ContinueStatement = 223,
        BreakStatement = 224,
        ReturnStatement = 225,
        WithStatement = 226,
        SwitchStatement = 227,
        LabeledStatement = 228,
        ThrowStatement = 229,
        TryStatement = 230,
        DebuggerStatement = 231,
        VariableDeclaration = 232,
        VariableDeclarationList = 233,
        FunctionDeclaration = 234,
        ClassDeclaration = 235,
        InterfaceDeclaration = 236,
        TypeAliasDeclaration = 237,
        EnumDeclaration = 238,
        ModuleDeclaration = 239,
        ModuleBlock = 240,
        CaseBlock = 241,
        NamespaceExportDeclaration = 242,
        ImportEqualsDeclaration = 243,
        ImportDeclaration = 244,
        ImportClause = 245,
        NamespaceImport = 246,
        NamedImports = 247,
        ImportSpecifier = 248,
        ExportAssignment = 249,
        ExportDeclaration = 250,
        NamedExports = 251,
        ExportSpecifier = 252,
        MissingDeclaration = 253,
        ExternalModuleReference = 254,
        JsxElement = 255,
        JsxSelfClosingElement = 256,
        JsxOpeningElement = 257,
        JsxClosingElement = 258,
        JsxFragment = 259,
        JsxOpeningFragment = 260,
        JsxClosingFragment = 261,
        JsxAttribute = 262,
        JsxAttributes = 263,
        JsxSpreadAttribute = 264,
        JsxExpression = 265,
        CaseClause = 266,
        DefaultClause = 267,
        HeritageClause = 268,
        CatchClause = 269,
        PropertyAssignment = 270,
        ShorthandPropertyAssignment = 271,
        SpreadAssignment = 272,
        EnumMember = 273,
        SourceFile = 274,
        Bundle = 275,
        UnparsedSource = 276,
        InputFiles = 277,
        JSDocTypeExpression = 278,
        JSDocAllType = 279,
        JSDocUnknownType = 280,
        JSDocNullableType = 281,
        JSDocNonNullableType = 282,
        JSDocOptionalType = 283,
        JSDocFunctionType = 284,
        JSDocVariadicType = 285,
        JSDocComment = 286,
        JSDocTypeLiteral = 287,
        JSDocSignature = 288,
        JSDocTag = 289,
        JSDocAugmentsTag = 290,
        JSDocClassTag = 291,
        JSDocCallbackTag = 292,
        JSDocParameterTag = 293,
        JSDocReturnTag = 294,
        JSDocThisTag = 295,
        JSDocTypeTag = 296,
        JSDocTemplateTag = 297,
        JSDocTypedefTag = 298,
        JSDocPropertyTag = 299,
        SyntaxList = 300,
        NotEmittedStatement = 301,
        PartiallyEmittedExpression = 302,
        CommaListExpression = 303,
        MergeDeclarationMarker = 304,
        EndOfDeclarationMarker = 305,
        Count = 306,
        FirstAssignment = 58,
        LastAssignment = 70,
        FirstCompoundAssignment = 59,
        LastCompoundAssignment = 70,
        FirstReservedWord = 72,
        LastReservedWord = 107,
        FirstKeyword = 72,
        LastKeyword = 145,
        FirstFutureReservedWord = 108,
        LastFutureReservedWord = 116,
        FirstTypeNode = 161,
        LastTypeNode = 179,
        FirstPunctuation = 17,
        LastPunctuation = 70,
        FirstToken = 0,
        LastToken = 145,
        FirstTriviaToken = 2,
        LastTriviaToken = 7,
        FirstLiteralToken = 8,
        LastLiteralToken = 13,
        FirstTemplateToken = 13,
        LastTemplateToken = 16,
        FirstBinaryOperator = 27,
        LastBinaryOperator = 70,
        FirstNode = 146,
        FirstJSDocNode = 278,
        LastJSDocNode = 299,
        FirstJSDocTagNode = 289,
        LastJSDocTagNode = 299
    }
    enum NodeFlags {
        None = 0,
        Let = 1,
        Const = 2,
        NestedNamespace = 4,
        Synthesized = 8,
        Namespace = 16,
        ExportContext = 32,
        ContainsThis = 64,
        HasImplicitReturn = 128,
        HasExplicitReturn = 256,
        GlobalAugmentation = 512,
        HasAsyncFunctions = 1024,
        DisallowInContext = 2048,
        YieldContext = 4096,
        DecoratorContext = 8192,
        AwaitContext = 16384,
        ThisNodeHasError = 32768,
        JavaScriptFile = 65536,
        ThisNodeOrAnySubNodesHasError = 131072,
        HasAggregatedChildData = 262144,
        JSDoc = 2097152,
        JsonFile = 16777216,
        BlockScoped = 3,
        ReachabilityCheckFlags = 384,
        ReachabilityAndEmitFlags = 1408,
        ContextFlags = 12679168,
        TypeExcludesFlags = 20480
    }
    enum ModifierFlags {
        None = 0,
        Export = 1,
        Ambient = 2,
        Public = 4,
        Private = 8,
        Protected = 16,
        Static = 32,
        Readonly = 64,
        Abstract = 128,
        Async = 256,
        Default = 512,
        Const = 2048,
        HasComputedFlags = 536870912,
        AccessibilityModifier = 28,
        ParameterPropertyModifier = 92,
        NonPublicAccessibilityModifier = 24,
        TypeScriptModifier = 2270,
        ExportDefault = 513,
        All = 3071
    }
    enum JsxFlags {
        None = 0,
        /** An element from a named property of the JSX.IntrinsicElements interface */
        IntrinsicNamedElement = 1,
        /** An element inferred from the string index signature of the JSX.IntrinsicElements interface */
        IntrinsicIndexedElement = 2,
        IntrinsicElement = 3
    }
    interface Node extends TextRange {
        kind: SyntaxKind;
        flags: NodeFlags;
        decorators?: NodeArray<Decorator>;
        modifiers?: ModifiersArray;
        parent: Node;
    }
    interface JSDocContainer {
    }
    type HasJSDoc = ParameterDeclaration | CallSignatureDeclaration | ConstructSignatureDeclaration | MethodSignature | PropertySignature | ArrowFunction | ParenthesizedExpression | SpreadAssignment | ShorthandPropertyAssignment | PropertyAssignment | FunctionExpression | LabeledStatement | ExpressionStatement | VariableStatement | FunctionDeclaration | ConstructorDeclaration | MethodDeclaration | PropertyDeclaration | AccessorDeclaration | ClassLikeDeclaration | InterfaceDeclaration | TypeAliasDeclaration | EnumMember | EnumDeclaration | ModuleDeclaration | ImportEqualsDeclaration | IndexSignatureDeclaration | FunctionTypeNode | ConstructorTypeNode | JSDocFunctionType | EndOfFileToken;
    type HasType = SignatureDeclaration | VariableDeclaration | ParameterDeclaration | PropertySignature | PropertyDeclaration | TypePredicateNode | ParenthesizedTypeNode | TypeOperatorNode | MappedTypeNode | AssertionExpression | TypeAliasDeclaration | JSDocTypeExpression | JSDocNonNullableType | JSDocNullableType | JSDocOptionalType | JSDocVariadicType;
    type HasInitializer = HasExpressionInitializer | ForStatement | ForInStatement | ForOfStatement | JsxAttribute;
    type HasExpressionInitializer = VariableDeclaration | ParameterDeclaration | BindingElement | PropertySignature | PropertyDeclaration | PropertyAssignment | EnumMember;
    interface NodeArray<T extends Node> extends ReadonlyArray<T>, TextRange {
        hasTrailingComma?: boolean;
    }
    interface Token<TKind extends SyntaxKind> extends Node {
        kind: TKind;
    }
    type DotDotDotToken = Token<SyntaxKind.DotDotDotToken>;
    type QuestionToken = Token<SyntaxKind.QuestionToken>;
    type ExclamationToken = Token<SyntaxKind.ExclamationToken>;
    type ColonToken = Token<SyntaxKind.ColonToken>;
    type EqualsToken = Token<SyntaxKind.EqualsToken>;
    type AsteriskToken = Token<SyntaxKind.AsteriskToken>;
    type EqualsGreaterThanToken = Token<SyntaxKind.EqualsGreaterThanToken>;
    type EndOfFileToken = Token<SyntaxKind.EndOfFileToken> & JSDocContainer;
    type AtToken = Token<SyntaxKind.AtToken>;
    type ReadonlyToken = Token<SyntaxKind.ReadonlyKeyword>;
    type AwaitKeywordToken = Token<SyntaxKind.AwaitKeyword>;
    type PlusToken = Token<SyntaxKind.PlusToken>;
    type MinusToken = Token<SyntaxKind.MinusToken>;
    type Modifier = Token<SyntaxKind.AbstractKeyword> | Token<SyntaxKind.AsyncKeyword> | Token<SyntaxKind.ConstKeyword> | Token<SyntaxKind.DeclareKeyword> | Token<SyntaxKind.DefaultKeyword> | Token<SyntaxKind.ExportKeyword> | Token<SyntaxKind.PublicKeyword> | Token<SyntaxKind.PrivateKeyword> | Token<SyntaxKind.ProtectedKeyword> | Token<SyntaxKind.ReadonlyKeyword> | Token<SyntaxKind.StaticKeyword>;
    type ModifiersArray = NodeArray<Modifier>;
    interface Identifier extends PrimaryExpression, Declaration {
        kind: SyntaxKind.Identifier;
        /**
         * Prefer to use `id.unescapedText`. (Note: This is available only in services, not internally to the TypeScript compiler.)
         * Text of identifier, but if the identifier begins with two underscores, this will begin with three.
         */
        escapedText: __String;
        originalKeywordKind?: SyntaxKind;
        isInJSDocNamespace?: boolean;
    }
    interface TransientIdentifier extends Identifier {
        resolvedSymbol: Symbol;
    }
    interface QualifiedName extends Node {
        kind: SyntaxKind.QualifiedName;
        left: EntityName;
        right: Identifier;
    }
    type EntityName = Identifier | QualifiedName;
    type PropertyName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName;
    type DeclarationName = Identifier | StringLiteral | NumericLiteral | ComputedPropertyName | BindingPattern;
    interface Declaration extends Node {
        _declarationBrand: any;
    }
    interface NamedDeclaration extends Declaration {
        name?: DeclarationName;
    }
    interface DeclarationStatement extends NamedDeclaration, Statement {
        name?: Identifier | StringLiteral | NumericLiteral;
    }
    interface ComputedPropertyName extends Node {
        kind: SyntaxKind.ComputedPropertyName;
        expression: Expression;
    }
    interface Decorator extends Node {
        kind: SyntaxKind.Decorator;
        parent: NamedDeclaration;
        expression: LeftHandSideExpression;
    }
    interface TypeParameterDeclaration extends NamedDeclaration {
        kind: SyntaxKind.TypeParameter;
        parent: DeclarationWithTypeParameters | InferTypeNode;
        name: Identifier;
        constraint?: TypeNode;
        default?: TypeNode;
        expression?: Expression;
    }
    interface SignatureDeclarationBase extends NamedDeclaration, JSDocContainer {
        kind: SignatureDeclaration["kind"];
        name?: PropertyName;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        parameters: NodeArray<ParameterDeclaration>;
        type?: TypeNode;
    }
    type SignatureDeclaration = CallSignatureDeclaration | ConstructSignatureDeclaration | MethodSignature | IndexSignatureDeclaration | FunctionTypeNode | ConstructorTypeNode | JSDocFunctionType | FunctionDeclaration | MethodDeclaration | ConstructorDeclaration | AccessorDeclaration | FunctionExpression | ArrowFunction;
    interface CallSignatureDeclaration extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.CallSignature;
    }
    interface ConstructSignatureDeclaration extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.ConstructSignature;
    }
    type BindingName = Identifier | BindingPattern;
    interface VariableDeclaration extends NamedDeclaration {
        kind: SyntaxKind.VariableDeclaration;
        parent: VariableDeclarationList | CatchClause;
        name: BindingName;
        exclamationToken?: ExclamationToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface VariableDeclarationList extends Node {
        kind: SyntaxKind.VariableDeclarationList;
        parent: VariableStatement | ForStatement | ForOfStatement | ForInStatement;
        declarations: NodeArray<VariableDeclaration>;
    }
    interface ParameterDeclaration extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.Parameter;
        parent: SignatureDeclaration;
        dotDotDotToken?: DotDotDotToken;
        name: BindingName;
        questionToken?: QuestionToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface BindingElement extends NamedDeclaration {
        kind: SyntaxKind.BindingElement;
        parent: BindingPattern;
        propertyName?: PropertyName;
        dotDotDotToken?: DotDotDotToken;
        name: BindingName;
        initializer?: Expression;
    }
    interface PropertySignature extends TypeElement, JSDocContainer {
        kind: SyntaxKind.PropertySignature;
        name: PropertyName;
        questionToken?: QuestionToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface PropertyDeclaration extends ClassElement, JSDocContainer {
        kind: SyntaxKind.PropertyDeclaration;
        parent: ClassLikeDeclaration;
        name: PropertyName;
        questionToken?: QuestionToken;
        exclamationToken?: ExclamationToken;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface ObjectLiteralElement extends NamedDeclaration {
        _objectLiteralBrandBrand: any;
        name?: PropertyName;
    }
    type ObjectLiteralElementLike = PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | MethodDeclaration | AccessorDeclaration;
    interface PropertyAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.PropertyAssignment;
        name: PropertyName;
        questionToken?: QuestionToken;
        initializer: Expression;
    }
    interface ShorthandPropertyAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.ShorthandPropertyAssignment;
        name: Identifier;
        questionToken?: QuestionToken;
        equalsToken?: Token<SyntaxKind.EqualsToken>;
        objectAssignmentInitializer?: Expression;
    }
    interface SpreadAssignment extends ObjectLiteralElement, JSDocContainer {
        parent: ObjectLiteralExpression;
        kind: SyntaxKind.SpreadAssignment;
        expression: Expression;
    }
    type VariableLikeDeclaration = VariableDeclaration | ParameterDeclaration | BindingElement | PropertyDeclaration | PropertyAssignment | PropertySignature | JsxAttribute | ShorthandPropertyAssignment | EnumMember | JSDocPropertyTag | JSDocParameterTag;
    interface PropertyLikeDeclaration extends NamedDeclaration {
        name: PropertyName;
    }
    interface ObjectBindingPattern extends Node {
        kind: SyntaxKind.ObjectBindingPattern;
        parent: VariableDeclaration | ParameterDeclaration | BindingElement;
        elements: NodeArray<BindingElement>;
    }
    interface ArrayBindingPattern extends Node {
        kind: SyntaxKind.ArrayBindingPattern;
        parent: VariableDeclaration | ParameterDeclaration | BindingElement;
        elements: NodeArray<ArrayBindingElement>;
    }
    type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
    type ArrayBindingElement = BindingElement | OmittedExpression;
    /**
     * Several node kinds share function-like features such as a signature,
     * a name, and a body. These nodes should extend FunctionLikeDeclarationBase.
     * Examples:
     * - FunctionDeclaration
     * - MethodDeclaration
     * - AccessorDeclaration
     */
    interface FunctionLikeDeclarationBase extends SignatureDeclarationBase {
        _functionLikeDeclarationBrand: any;
        asteriskToken?: AsteriskToken;
        questionToken?: QuestionToken;
        body?: Block | Expression;
    }
    type FunctionLikeDeclaration = FunctionDeclaration | MethodDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration | FunctionExpression | ArrowFunction;
    /** @deprecated Use SignatureDeclaration */
    type FunctionLike = SignatureDeclaration;
    interface FunctionDeclaration extends FunctionLikeDeclarationBase, DeclarationStatement {
        kind: SyntaxKind.FunctionDeclaration;
        name?: Identifier;
        body?: FunctionBody;
    }
    interface MethodSignature extends SignatureDeclarationBase, TypeElement {
        kind: SyntaxKind.MethodSignature;
        parent: ObjectTypeDeclaration;
        name: PropertyName;
    }
    interface MethodDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.MethodDeclaration;
        parent: ClassLikeDeclaration | ObjectLiteralExpression;
        name: PropertyName;
        body?: FunctionBody;
    }
    interface ConstructorDeclaration extends FunctionLikeDeclarationBase, ClassElement, JSDocContainer {
        kind: SyntaxKind.Constructor;
        parent: ClassLikeDeclaration;
        body?: FunctionBody;
    }
    /** For when we encounter a semicolon in a class declaration. ES6 allows these as class elements. */
    interface SemicolonClassElement extends ClassElement {
        kind: SyntaxKind.SemicolonClassElement;
        parent: ClassLikeDeclaration;
    }
    interface GetAccessorDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.GetAccessor;
        parent: ClassLikeDeclaration | ObjectLiteralExpression;
        name: PropertyName;
        body?: FunctionBody;
    }
    interface SetAccessorDeclaration extends FunctionLikeDeclarationBase, ClassElement, ObjectLiteralElement, JSDocContainer {
        kind: SyntaxKind.SetAccessor;
        parent: ClassLikeDeclaration | ObjectLiteralExpression;
        name: PropertyName;
        body?: FunctionBody;
    }
    type AccessorDeclaration = GetAccessorDeclaration | SetAccessorDeclaration;
    interface IndexSignatureDeclaration extends SignatureDeclarationBase, ClassElement, TypeElement {
        kind: SyntaxKind.IndexSignature;
        parent: ObjectTypeDeclaration;
    }
    interface TypeNode extends Node {
        _typeNodeBrand: any;
    }
    interface KeywordTypeNode extends TypeNode {
        kind: SyntaxKind.AnyKeyword | SyntaxKind.UnknownKeyword | SyntaxKind.NumberKeyword | SyntaxKind.ObjectKeyword | SyntaxKind.BooleanKeyword | SyntaxKind.StringKeyword | SyntaxKind.SymbolKeyword | SyntaxKind.ThisKeyword | SyntaxKind.VoidKeyword | SyntaxKind.UndefinedKeyword | SyntaxKind.NullKeyword | SyntaxKind.NeverKeyword;
    }
    interface ImportTypeNode extends NodeWithTypeArguments {
        kind: SyntaxKind.ImportType;
        isTypeOf?: boolean;
        argument: TypeNode;
        qualifier?: EntityName;
    }
    interface ThisTypeNode extends TypeNode {
        kind: SyntaxKind.ThisType;
    }
    type FunctionOrConstructorTypeNode = FunctionTypeNode | ConstructorTypeNode;
    interface FunctionOrConstructorTypeNodeBase extends TypeNode, SignatureDeclarationBase {
        kind: SyntaxKind.FunctionType | SyntaxKind.ConstructorType;
        type: TypeNode;
    }
    interface FunctionTypeNode extends FunctionOrConstructorTypeNodeBase {
        kind: SyntaxKind.FunctionType;
    }
    interface ConstructorTypeNode extends FunctionOrConstructorTypeNodeBase {
        kind: SyntaxKind.ConstructorType;
    }
    interface NodeWithTypeArguments extends TypeNode {
        typeArguments?: NodeArray<TypeNode>;
    }
    type TypeReferenceType = TypeReferenceNode | ExpressionWithTypeArguments;
    interface TypeReferenceNode extends NodeWithTypeArguments {
        kind: SyntaxKind.TypeReference;
        typeName: EntityName;
    }
    interface TypePredicateNode extends TypeNode {
        kind: SyntaxKind.TypePredicate;
        parent: SignatureDeclaration;
        parameterName: Identifier | ThisTypeNode;
        type: TypeNode;
    }
    interface TypeQueryNode extends TypeNode {
        kind: SyntaxKind.TypeQuery;
        exprName: EntityName;
    }
    interface TypeLiteralNode extends TypeNode, Declaration {
        kind: SyntaxKind.TypeLiteral;
        members: NodeArray<TypeElement>;
    }
    interface ArrayTypeNode extends TypeNode {
        kind: SyntaxKind.ArrayType;
        elementType: TypeNode;
    }
    interface TupleTypeNode extends TypeNode {
        kind: SyntaxKind.TupleType;
        elementTypes: NodeArray<TypeNode>;
    }
    type UnionOrIntersectionTypeNode = UnionTypeNode | IntersectionTypeNode;
    interface UnionTypeNode extends TypeNode {
        kind: SyntaxKind.UnionType;
        types: NodeArray<TypeNode>;
    }
    interface IntersectionTypeNode extends TypeNode {
        kind: SyntaxKind.IntersectionType;
        types: NodeArray<TypeNode>;
    }
    interface ConditionalTypeNode extends TypeNode {
        kind: SyntaxKind.ConditionalType;
        checkType: TypeNode;
        extendsType: TypeNode;
        trueType: TypeNode;
        falseType: TypeNode;
    }
    interface InferTypeNode extends TypeNode {
        kind: SyntaxKind.InferType;
        typeParameter: TypeParameterDeclaration;
    }
    interface ParenthesizedTypeNode extends TypeNode {
        kind: SyntaxKind.ParenthesizedType;
        type: TypeNode;
    }
    interface TypeOperatorNode extends TypeNode {
        kind: SyntaxKind.TypeOperator;
        operator: SyntaxKind.KeyOfKeyword | SyntaxKind.UniqueKeyword;
        type: TypeNode;
    }
    interface IndexedAccessTypeNode extends TypeNode {
        kind: SyntaxKind.IndexedAccessType;
        objectType: TypeNode;
        indexType: TypeNode;
    }
    interface MappedTypeNode extends TypeNode, Declaration {
        kind: SyntaxKind.MappedType;
        readonlyToken?: ReadonlyToken | PlusToken | MinusToken;
        typeParameter: TypeParameterDeclaration;
        questionToken?: QuestionToken | PlusToken | MinusToken;
        type?: TypeNode;
    }
    interface LiteralTypeNode extends TypeNode {
        kind: SyntaxKind.LiteralType;
        literal: BooleanLiteral | LiteralExpression | PrefixUnaryExpression;
    }
    interface StringLiteral extends LiteralExpression {
        kind: SyntaxKind.StringLiteral;
    }
    type StringLiteralLike = StringLiteral | NoSubstitutionTemplateLiteral;
    interface Expression extends Node {
        _expressionBrand: any;
    }
    interface OmittedExpression extends Expression {
        kind: SyntaxKind.OmittedExpression;
    }
    interface PartiallyEmittedExpression extends LeftHandSideExpression {
        kind: SyntaxKind.PartiallyEmittedExpression;
        expression: Expression;
    }
    interface UnaryExpression extends Expression {
        _unaryExpressionBrand: any;
    }
    /** Deprecated, please use UpdateExpression */
    type IncrementExpression = UpdateExpression;
    interface UpdateExpression extends UnaryExpression {
        _updateExpressionBrand: any;
    }
    type PrefixUnaryOperator = SyntaxKind.PlusPlusToken | SyntaxKind.MinusMinusToken | SyntaxKind.PlusToken | SyntaxKind.MinusToken | SyntaxKind.TildeToken | SyntaxKind.ExclamationToken;
    interface PrefixUnaryExpression extends UpdateExpression {
        kind: SyntaxKind.PrefixUnaryExpression;
        operator: PrefixUnaryOperator;
        operand: UnaryExpression;
    }
    type PostfixUnaryOperator = SyntaxKind.PlusPlusToken | SyntaxKind.MinusMinusToken;
    interface PostfixUnaryExpression extends UpdateExpression {
        kind: SyntaxKind.PostfixUnaryExpression;
        operand: LeftHandSideExpression;
        operator: PostfixUnaryOperator;
    }
    interface LeftHandSideExpression extends UpdateExpression {
        _leftHandSideExpressionBrand: any;
    }
    interface MemberExpression extends LeftHandSideExpression {
        _memberExpressionBrand: any;
    }
    interface PrimaryExpression extends MemberExpression {
        _primaryExpressionBrand: any;
    }
    interface NullLiteral extends PrimaryExpression, TypeNode {
        kind: SyntaxKind.NullKeyword;
    }
    interface BooleanLiteral extends PrimaryExpression, TypeNode {
        kind: SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword;
    }
    interface ThisExpression extends PrimaryExpression, KeywordTypeNode {
        kind: SyntaxKind.ThisKeyword;
    }
    interface SuperExpression extends PrimaryExpression {
        kind: SyntaxKind.SuperKeyword;
    }
    interface ImportExpression extends PrimaryExpression {
        kind: SyntaxKind.ImportKeyword;
    }
    interface DeleteExpression extends UnaryExpression {
        kind: SyntaxKind.DeleteExpression;
        expression: UnaryExpression;
    }
    interface TypeOfExpression extends UnaryExpression {
        kind: SyntaxKind.TypeOfExpression;
        expression: UnaryExpression;
    }
    interface VoidExpression extends UnaryExpression {
        kind: SyntaxKind.VoidExpression;
        expression: UnaryExpression;
    }
    interface AwaitExpression extends UnaryExpression {
        kind: SyntaxKind.AwaitExpression;
        expression: UnaryExpression;
    }
    interface YieldExpression extends Expression {
        kind: SyntaxKind.YieldExpression;
        asteriskToken?: AsteriskToken;
        expression?: Expression;
    }
    type ExponentiationOperator = SyntaxKind.AsteriskAsteriskToken;
    type MultiplicativeOperator = SyntaxKind.AsteriskToken | SyntaxKind.SlashToken | SyntaxKind.PercentToken;
    type MultiplicativeOperatorOrHigher = ExponentiationOperator | MultiplicativeOperator;
    type AdditiveOperator = SyntaxKind.PlusToken | SyntaxKind.MinusToken;
    type AdditiveOperatorOrHigher = MultiplicativeOperatorOrHigher | AdditiveOperator;
    type ShiftOperator = SyntaxKind.LessThanLessThanToken | SyntaxKind.GreaterThanGreaterThanToken | SyntaxKind.GreaterThanGreaterThanGreaterThanToken;
    type ShiftOperatorOrHigher = AdditiveOperatorOrHigher | ShiftOperator;
    type RelationalOperator = SyntaxKind.LessThanToken | SyntaxKind.LessThanEqualsToken | SyntaxKind.GreaterThanToken | SyntaxKind.GreaterThanEqualsToken | SyntaxKind.InstanceOfKeyword | SyntaxKind.InKeyword;
    type RelationalOperatorOrHigher = ShiftOperatorOrHigher | RelationalOperator;
    type EqualityOperator = SyntaxKind.EqualsEqualsToken | SyntaxKind.EqualsEqualsEqualsToken | SyntaxKind.ExclamationEqualsEqualsToken | SyntaxKind.ExclamationEqualsToken;
    type EqualityOperatorOrHigher = RelationalOperatorOrHigher | EqualityOperator;
    type BitwiseOperator = SyntaxKind.AmpersandToken | SyntaxKind.BarToken | SyntaxKind.CaretToken;
    type BitwiseOperatorOrHigher = EqualityOperatorOrHigher | BitwiseOperator;
    type LogicalOperator = SyntaxKind.AmpersandAmpersandToken | SyntaxKind.BarBarToken;
    type LogicalOperatorOrHigher = BitwiseOperatorOrHigher | LogicalOperator;
    type CompoundAssignmentOperator = SyntaxKind.PlusEqualsToken | SyntaxKind.MinusEqualsToken | SyntaxKind.AsteriskAsteriskEqualsToken | SyntaxKind.AsteriskEqualsToken | SyntaxKind.SlashEqualsToken | SyntaxKind.PercentEqualsToken | SyntaxKind.AmpersandEqualsToken | SyntaxKind.BarEqualsToken | SyntaxKind.CaretEqualsToken | SyntaxKind.LessThanLessThanEqualsToken | SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken | SyntaxKind.GreaterThanGreaterThanEqualsToken;
    type AssignmentOperator = SyntaxKind.EqualsToken | CompoundAssignmentOperator;
    type AssignmentOperatorOrHigher = LogicalOperatorOrHigher | AssignmentOperator;
    type BinaryOperator = AssignmentOperatorOrHigher | SyntaxKind.CommaToken;
    type BinaryOperatorToken = Token<BinaryOperator>;
    interface BinaryExpression extends Expression, Declaration {
        kind: SyntaxKind.BinaryExpression;
        left: Expression;
        operatorToken: BinaryOperatorToken;
        right: Expression;
    }
    type AssignmentOperatorToken = Token<AssignmentOperator>;
    interface AssignmentExpression<TOperator extends AssignmentOperatorToken> extends BinaryExpression {
        left: LeftHandSideExpression;
        operatorToken: TOperator;
    }
    interface ObjectDestructuringAssignment extends AssignmentExpression<EqualsToken> {
        left: ObjectLiteralExpression;
    }
    interface ArrayDestructuringAssignment extends AssignmentExpression<EqualsToken> {
        left: ArrayLiteralExpression;
    }
    type DestructuringAssignment = ObjectDestructuringAssignment | ArrayDestructuringAssignment;
    type BindingOrAssignmentElement = VariableDeclaration | ParameterDeclaration | BindingElement | PropertyAssignment | ShorthandPropertyAssignment | SpreadAssignment | OmittedExpression | SpreadElement | ArrayLiteralExpression | ObjectLiteralExpression | AssignmentExpression<EqualsToken> | Identifier | PropertyAccessExpression | ElementAccessExpression;
    type BindingOrAssignmentElementRestIndicator = DotDotDotToken | SpreadElement | SpreadAssignment;
    type BindingOrAssignmentElementTarget = BindingOrAssignmentPattern | Identifier | PropertyAccessExpression | ElementAccessExpression | OmittedExpression;
    type ObjectBindingOrAssignmentPattern = ObjectBindingPattern | ObjectLiteralExpression;
    type ArrayBindingOrAssignmentPattern = ArrayBindingPattern | ArrayLiteralExpression;
    type AssignmentPattern = ObjectLiteralExpression | ArrayLiteralExpression;
    type BindingOrAssignmentPattern = ObjectBindingOrAssignmentPattern | ArrayBindingOrAssignmentPattern;
    interface ConditionalExpression extends Expression {
        kind: SyntaxKind.ConditionalExpression;
        condition: Expression;
        questionToken: QuestionToken;
        whenTrue: Expression;
        colonToken: ColonToken;
        whenFalse: Expression;
    }
    type FunctionBody = Block;
    type ConciseBody = FunctionBody | Expression;
    interface FunctionExpression extends PrimaryExpression, FunctionLikeDeclarationBase, JSDocContainer {
        kind: SyntaxKind.FunctionExpression;
        name?: Identifier;
        body: FunctionBody;
    }
    interface ArrowFunction extends Expression, FunctionLikeDeclarationBase, JSDocContainer {
        kind: SyntaxKind.ArrowFunction;
        equalsGreaterThanToken: EqualsGreaterThanToken;
        body: ConciseBody;
        name: never;
    }
    interface LiteralLikeNode extends Node {
        text: string;
        isUnterminated?: boolean;
        hasExtendedUnicodeEscape?: boolean;
    }
    interface LiteralExpression extends LiteralLikeNode, PrimaryExpression {
        _literalExpressionBrand: any;
    }
    interface RegularExpressionLiteral extends LiteralExpression {
        kind: SyntaxKind.RegularExpressionLiteral;
    }
    interface NoSubstitutionTemplateLiteral extends LiteralExpression {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral;
    }
    interface NumericLiteral extends LiteralExpression {
        kind: SyntaxKind.NumericLiteral;
    }
    interface TemplateHead extends LiteralLikeNode {
        kind: SyntaxKind.TemplateHead;
        parent: TemplateExpression;
    }
    interface TemplateMiddle extends LiteralLikeNode {
        kind: SyntaxKind.TemplateMiddle;
        parent: TemplateSpan;
    }
    interface TemplateTail extends LiteralLikeNode {
        kind: SyntaxKind.TemplateTail;
        parent: TemplateSpan;
    }
    type TemplateLiteral = TemplateExpression | NoSubstitutionTemplateLiteral;
    interface TemplateExpression extends PrimaryExpression {
        kind: SyntaxKind.TemplateExpression;
        head: TemplateHead;
        templateSpans: NodeArray<TemplateSpan>;
    }
    interface TemplateSpan extends Node {
        kind: SyntaxKind.TemplateSpan;
        parent: TemplateExpression;
        expression: Expression;
        literal: TemplateMiddle | TemplateTail;
    }
    interface ParenthesizedExpression extends PrimaryExpression, JSDocContainer {
        kind: SyntaxKind.ParenthesizedExpression;
        expression: Expression;
    }
    interface ArrayLiteralExpression extends PrimaryExpression {
        kind: SyntaxKind.ArrayLiteralExpression;
        elements: NodeArray<Expression>;
    }
    interface SpreadElement extends Expression {
        kind: SyntaxKind.SpreadElement;
        parent: ArrayLiteralExpression | CallExpression | NewExpression;
        expression: Expression;
    }
    /**
     * This interface is a base interface for ObjectLiteralExpression and JSXAttributes to extend from. JSXAttributes is similar to
     * ObjectLiteralExpression in that it contains array of properties; however, JSXAttributes' properties can only be
     * JSXAttribute or JSXSpreadAttribute. ObjectLiteralExpression, on the other hand, can only have properties of type
     * ObjectLiteralElement (e.g. PropertyAssignment, ShorthandPropertyAssignment etc.)
     */
    interface ObjectLiteralExpressionBase<T extends ObjectLiteralElement> extends PrimaryExpression, Declaration {
        properties: NodeArray<T>;
    }
    interface ObjectLiteralExpression extends ObjectLiteralExpressionBase<ObjectLiteralElementLike> {
        kind: SyntaxKind.ObjectLiteralExpression;
    }
    type EntityNameExpression = Identifier | PropertyAccessEntityNameExpression;
    type EntityNameOrEntityNameExpression = EntityName | EntityNameExpression;
    interface PropertyAccessExpression extends MemberExpression, NamedDeclaration {
        kind: SyntaxKind.PropertyAccessExpression;
        expression: LeftHandSideExpression;
        name: Identifier;
    }
    interface SuperPropertyAccessExpression extends PropertyAccessExpression {
        expression: SuperExpression;
    }
    /** Brand for a PropertyAccessExpression which, like a QualifiedName, consists of a sequence of identifiers separated by dots. */
    interface PropertyAccessEntityNameExpression extends PropertyAccessExpression {
        _propertyAccessExpressionLikeQualifiedNameBrand?: any;
        expression: EntityNameExpression;
    }
    interface ElementAccessExpression extends MemberExpression {
        kind: SyntaxKind.ElementAccessExpression;
        expression: LeftHandSideExpression;
        argumentExpression: Expression;
    }
    interface SuperElementAccessExpression extends ElementAccessExpression {
        expression: SuperExpression;
    }
    type SuperProperty = SuperPropertyAccessExpression | SuperElementAccessExpression;
    interface CallExpression extends LeftHandSideExpression, Declaration {
        kind: SyntaxKind.CallExpression;
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments: NodeArray<Expression>;
    }
    interface SuperCall extends CallExpression {
        expression: SuperExpression;
    }
    interface ImportCall extends CallExpression {
        expression: ImportExpression;
    }
    interface ExpressionWithTypeArguments extends NodeWithTypeArguments {
        kind: SyntaxKind.ExpressionWithTypeArguments;
        parent: HeritageClause;
        expression: LeftHandSideExpression;
    }
    interface NewExpression extends PrimaryExpression, Declaration {
        kind: SyntaxKind.NewExpression;
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments?: NodeArray<Expression>;
    }
    interface TaggedTemplateExpression extends MemberExpression {
        kind: SyntaxKind.TaggedTemplateExpression;
        tag: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        template: TemplateLiteral;
    }
    type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression | Decorator | JsxOpeningLikeElement;
    interface AsExpression extends Expression {
        kind: SyntaxKind.AsExpression;
        expression: Expression;
        type: TypeNode;
    }
    interface TypeAssertion extends UnaryExpression {
        kind: SyntaxKind.TypeAssertionExpression;
        type: TypeNode;
        expression: UnaryExpression;
    }
    type AssertionExpression = TypeAssertion | AsExpression;
    interface NonNullExpression extends LeftHandSideExpression {
        kind: SyntaxKind.NonNullExpression;
        expression: Expression;
    }
    interface MetaProperty extends PrimaryExpression {
        kind: SyntaxKind.MetaProperty;
        keywordToken: SyntaxKind.NewKeyword | SyntaxKind.ImportKeyword;
        name: Identifier;
    }
    interface JsxElement extends PrimaryExpression {
        kind: SyntaxKind.JsxElement;
        openingElement: JsxOpeningElement;
        children: NodeArray<JsxChild>;
        closingElement: JsxClosingElement;
    }
    type JsxOpeningLikeElement = JsxSelfClosingElement | JsxOpeningElement;
    type JsxAttributeLike = JsxAttribute | JsxSpreadAttribute;
    type JsxTagNameExpression = PrimaryExpression | PropertyAccessExpression;
    interface JsxAttributes extends ObjectLiteralExpressionBase<JsxAttributeLike> {
        parent: JsxOpeningLikeElement;
    }
    interface JsxOpeningElement extends Expression {
        kind: SyntaxKind.JsxOpeningElement;
        parent: JsxElement;
        tagName: JsxTagNameExpression;
        typeArguments?: NodeArray<TypeNode>;
        attributes: JsxAttributes;
    }
    interface JsxSelfClosingElement extends PrimaryExpression {
        kind: SyntaxKind.JsxSelfClosingElement;
        tagName: JsxTagNameExpression;
        typeArguments?: NodeArray<TypeNode>;
        attributes: JsxAttributes;
    }
    interface JsxFragment extends PrimaryExpression {
        kind: SyntaxKind.JsxFragment;
        openingFragment: JsxOpeningFragment;
        children: NodeArray<JsxChild>;
        closingFragment: JsxClosingFragment;
    }
    interface JsxOpeningFragment extends Expression {
        kind: SyntaxKind.JsxOpeningFragment;
        parent: JsxFragment;
    }
    interface JsxClosingFragment extends Expression {
        kind: SyntaxKind.JsxClosingFragment;
        parent: JsxFragment;
    }
    interface JsxAttribute extends ObjectLiteralElement {
        kind: SyntaxKind.JsxAttribute;
        parent: JsxAttributes;
        name: Identifier;
        initializer?: StringLiteral | JsxExpression;
    }
    interface JsxSpreadAttribute extends ObjectLiteralElement {
        kind: SyntaxKind.JsxSpreadAttribute;
        parent: JsxAttributes;
        expression: Expression;
    }
    interface JsxClosingElement extends Node {
        kind: SyntaxKind.JsxClosingElement;
        parent: JsxElement;
        tagName: JsxTagNameExpression;
    }
    interface JsxExpression extends Expression {
        kind: SyntaxKind.JsxExpression;
        parent: JsxElement | JsxAttributeLike;
        dotDotDotToken?: Token<SyntaxKind.DotDotDotToken>;
        expression?: Expression;
    }
    interface JsxText extends Node {
        kind: SyntaxKind.JsxText;
        containsOnlyWhiteSpaces: boolean;
        parent: JsxElement;
    }
    type JsxChild = JsxText | JsxExpression | JsxElement | JsxSelfClosingElement | JsxFragment;
    interface Statement extends Node {
        _statementBrand: any;
    }
    interface NotEmittedStatement extends Statement {
        kind: SyntaxKind.NotEmittedStatement;
    }
    /**
     * A list of comma-separated expressions. This node is only created by transformations.
     */
    interface CommaListExpression extends Expression {
        kind: SyntaxKind.CommaListExpression;
        elements: NodeArray<Expression>;
    }
    interface EmptyStatement extends Statement {
        kind: SyntaxKind.EmptyStatement;
    }
    interface DebuggerStatement extends Statement {
        kind: SyntaxKind.DebuggerStatement;
    }
    interface MissingDeclaration extends DeclarationStatement {
        kind: SyntaxKind.MissingDeclaration;
        name?: Identifier;
    }
    type BlockLike = SourceFile | Block | ModuleBlock | CaseOrDefaultClause;
    interface Block extends Statement {
        kind: SyntaxKind.Block;
        statements: NodeArray<Statement>;
    }
    interface VariableStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.VariableStatement;
        declarationList: VariableDeclarationList;
    }
    interface ExpressionStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.ExpressionStatement;
        expression: Expression;
    }
    interface IfStatement extends Statement {
        kind: SyntaxKind.IfStatement;
        expression: Expression;
        thenStatement: Statement;
        elseStatement?: Statement;
    }
    interface IterationStatement extends Statement {
        statement: Statement;
    }
    interface DoStatement extends IterationStatement {
        kind: SyntaxKind.DoStatement;
        expression: Expression;
    }
    interface WhileStatement extends IterationStatement {
        kind: SyntaxKind.WhileStatement;
        expression: Expression;
    }
    type ForInitializer = VariableDeclarationList | Expression;
    interface ForStatement extends IterationStatement {
        kind: SyntaxKind.ForStatement;
        initializer?: ForInitializer;
        condition?: Expression;
        incrementor?: Expression;
    }
    type ForInOrOfStatement = ForInStatement | ForOfStatement;
    interface ForInStatement extends IterationStatement {
        kind: SyntaxKind.ForInStatement;
        initializer: ForInitializer;
        expression: Expression;
    }
    interface ForOfStatement extends IterationStatement {
        kind: SyntaxKind.ForOfStatement;
        awaitModifier?: AwaitKeywordToken;
        initializer: ForInitializer;
        expression: Expression;
    }
    interface BreakStatement extends Statement {
        kind: SyntaxKind.BreakStatement;
        label?: Identifier;
    }
    interface ContinueStatement extends Statement {
        kind: SyntaxKind.ContinueStatement;
        label?: Identifier;
    }
    type BreakOrContinueStatement = BreakStatement | ContinueStatement;
    interface ReturnStatement extends Statement {
        kind: SyntaxKind.ReturnStatement;
        expression?: Expression;
    }
    interface WithStatement extends Statement {
        kind: SyntaxKind.WithStatement;
        expression: Expression;
        statement: Statement;
    }
    interface SwitchStatement extends Statement {
        kind: SyntaxKind.SwitchStatement;
        expression: Expression;
        caseBlock: CaseBlock;
        possiblyExhaustive?: boolean;
    }
    interface CaseBlock extends Node {
        kind: SyntaxKind.CaseBlock;
        parent: SwitchStatement;
        clauses: NodeArray<CaseOrDefaultClause>;
    }
    interface CaseClause extends Node {
        kind: SyntaxKind.CaseClause;
        parent: CaseBlock;
        expression: Expression;
        statements: NodeArray<Statement>;
    }
    interface DefaultClause extends Node {
        kind: SyntaxKind.DefaultClause;
        parent: CaseBlock;
        statements: NodeArray<Statement>;
    }
    type CaseOrDefaultClause = CaseClause | DefaultClause;
    interface LabeledStatement extends Statement, JSDocContainer {
        kind: SyntaxKind.LabeledStatement;
        label: Identifier;
        statement: Statement;
    }
    interface ThrowStatement extends Statement {
        kind: SyntaxKind.ThrowStatement;
        expression?: Expression;
    }
    interface TryStatement extends Statement {
        kind: SyntaxKind.TryStatement;
        tryBlock: Block;
        catchClause?: CatchClause;
        finallyBlock?: Block;
    }
    interface CatchClause extends Node {
        kind: SyntaxKind.CatchClause;
        parent: TryStatement;
        variableDeclaration?: VariableDeclaration;
        block: Block;
    }
    type ObjectTypeDeclaration = ClassLikeDeclaration | InterfaceDeclaration | TypeLiteralNode;
    type DeclarationWithTypeParameters = SignatureDeclaration | ClassLikeDeclaration | InterfaceDeclaration | TypeAliasDeclaration | JSDocTemplateTag | JSDocTypedefTag | JSDocCallbackTag | JSDocSignature;
    interface ClassLikeDeclarationBase extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.ClassDeclaration | SyntaxKind.ClassExpression;
        name?: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<ClassElement>;
    }
    interface ClassDeclaration extends ClassLikeDeclarationBase, DeclarationStatement {
        kind: SyntaxKind.ClassDeclaration;
        /** May be undefined in `export default class { ... }`. */
        name?: Identifier;
    }
    interface ClassExpression extends ClassLikeDeclarationBase, PrimaryExpression {
        kind: SyntaxKind.ClassExpression;
    }
    type ClassLikeDeclaration = ClassDeclaration | ClassExpression;
    interface ClassElement extends NamedDeclaration {
        _classElementBrand: any;
        name?: PropertyName;
    }
    interface TypeElement extends NamedDeclaration {
        _typeElementBrand: any;
        name?: PropertyName;
        questionToken?: QuestionToken;
    }
    interface InterfaceDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.InterfaceDeclaration;
        name: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<TypeElement>;
    }
    interface HeritageClause extends Node {
        kind: SyntaxKind.HeritageClause;
        parent: InterfaceDeclaration | ClassLikeDeclaration;
        token: SyntaxKind.ExtendsKeyword | SyntaxKind.ImplementsKeyword;
        types: NodeArray<ExpressionWithTypeArguments>;
    }
    interface TypeAliasDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.TypeAliasDeclaration;
        name: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        type: TypeNode;
    }
    interface EnumMember extends NamedDeclaration, JSDocContainer {
        kind: SyntaxKind.EnumMember;
        parent: EnumDeclaration;
        name: PropertyName;
        initializer?: Expression;
    }
    interface EnumDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.EnumDeclaration;
        name: Identifier;
        members: NodeArray<EnumMember>;
    }
    type ModuleName = Identifier | StringLiteral;
    type ModuleBody = NamespaceBody | JSDocNamespaceBody;
    interface ModuleDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.ModuleDeclaration;
        parent: ModuleBody | SourceFile;
        name: ModuleName;
        body?: ModuleBody | JSDocNamespaceDeclaration;
    }
    type NamespaceBody = ModuleBlock | NamespaceDeclaration;
    interface NamespaceDeclaration extends ModuleDeclaration {
        name: Identifier;
        body: NamespaceBody;
    }
    type JSDocNamespaceBody = Identifier | JSDocNamespaceDeclaration;
    interface JSDocNamespaceDeclaration extends ModuleDeclaration {
        name: Identifier;
        body?: JSDocNamespaceBody;
    }
    interface ModuleBlock extends Node, Statement {
        kind: SyntaxKind.ModuleBlock;
        parent: ModuleDeclaration;
        statements: NodeArray<Statement>;
    }
    type ModuleReference = EntityName | ExternalModuleReference;
    /**
     * One of:
     * - import x = require("mod");
     * - import x = M.x;
     */
    interface ImportEqualsDeclaration extends DeclarationStatement, JSDocContainer {
        kind: SyntaxKind.ImportEqualsDeclaration;
        parent: SourceFile | ModuleBlock;
        name: Identifier;
        moduleReference: ModuleReference;
    }
    interface ExternalModuleReference extends Node {
        kind: SyntaxKind.ExternalModuleReference;
        parent: ImportEqualsDeclaration;
        expression: Expression;
    }
    interface ImportDeclaration extends Statement {
        kind: SyntaxKind.ImportDeclaration;
        parent: SourceFile | ModuleBlock;
        importClause?: ImportClause;
        /** If this is not a StringLiteral it will be a grammar error. */
        moduleSpecifier: Expression;
    }
    type NamedImportBindings = NamespaceImport | NamedImports;
    interface ImportClause extends NamedDeclaration {
        kind: SyntaxKind.ImportClause;
        parent: ImportDeclaration;
        name?: Identifier;
        namedBindings?: NamedImportBindings;
    }
    interface NamespaceImport extends NamedDeclaration {
        kind: SyntaxKind.NamespaceImport;
        parent: ImportClause;
        name: Identifier;
    }
    interface NamespaceExportDeclaration extends DeclarationStatement {
        kind: SyntaxKind.NamespaceExportDeclaration;
        name: Identifier;
    }
    interface ExportDeclaration extends DeclarationStatement {
        kind: SyntaxKind.ExportDeclaration;
        parent: SourceFile | ModuleBlock;
        /** Will not be assigned in the case of `export * from "foo";` */
        exportClause?: NamedExports;
        /** If this is not a StringLiteral it will be a grammar error. */
        moduleSpecifier?: Expression;
    }
    interface NamedImports extends Node {
        kind: SyntaxKind.NamedImports;
        parent: ImportClause;
        elements: NodeArray<ImportSpecifier>;
    }
    interface NamedExports extends Node {
        kind: SyntaxKind.NamedExports;
        parent: ExportDeclaration;
        elements: NodeArray<ExportSpecifier>;
    }
    type NamedImportsOrExports = NamedImports | NamedExports;
    interface ImportSpecifier extends NamedDeclaration {
        kind: SyntaxKind.ImportSpecifier;
        parent: NamedImports;
        propertyName?: Identifier;
        name: Identifier;
    }
    interface ExportSpecifier extends NamedDeclaration {
        kind: SyntaxKind.ExportSpecifier;
        parent: NamedExports;
        propertyName?: Identifier;
        name: Identifier;
    }
    type ImportOrExportSpecifier = ImportSpecifier | ExportSpecifier;
    /**
     * This is either an `export =` or an `export default` declaration.
     * Unless `isExportEquals` is set, this node was parsed as an `export default`.
     */
    interface ExportAssignment extends DeclarationStatement {
        kind: SyntaxKind.ExportAssignment;
        parent: SourceFile;
        isExportEquals?: boolean;
        expression: Expression;
    }
    interface FileReference extends TextRange {
        fileName: string;
    }
    interface CheckJsDirective extends TextRange {
        enabled: boolean;
    }
    type CommentKind = SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
    interface CommentRange extends TextRange {
        hasTrailingNewLine?: boolean;
        kind: CommentKind;
    }
    interface SynthesizedComment extends CommentRange {
        text: string;
        pos: -1;
        end: -1;
    }
    interface JSDocTypeExpression extends TypeNode {
        kind: SyntaxKind.JSDocTypeExpression;
        type: TypeNode;
    }
    interface JSDocType extends TypeNode {
        _jsDocTypeBrand: any;
    }
    interface JSDocAllType extends JSDocType {
        kind: SyntaxKind.JSDocAllType;
    }
    interface JSDocUnknownType extends JSDocType {
        kind: SyntaxKind.JSDocUnknownType;
    }
    interface JSDocNonNullableType extends JSDocType {
        kind: SyntaxKind.JSDocNonNullableType;
        type: TypeNode;
    }
    interface JSDocNullableType extends JSDocType {
        kind: SyntaxKind.JSDocNullableType;
        type: TypeNode;
    }
    interface JSDocOptionalType extends JSDocType {
        kind: SyntaxKind.JSDocOptionalType;
        type: TypeNode;
    }
    interface JSDocFunctionType extends JSDocType, SignatureDeclarationBase {
        kind: SyntaxKind.JSDocFunctionType;
    }
    interface JSDocVariadicType extends JSDocType {
        kind: SyntaxKind.JSDocVariadicType;
        type: TypeNode;
    }
    type JSDocTypeReferencingNode = JSDocVariadicType | JSDocOptionalType | JSDocNullableType | JSDocNonNullableType;
    interface JSDoc extends Node {
        kind: SyntaxKind.JSDocComment;
        parent: HasJSDoc;
        tags?: NodeArray<JSDocTag>;
        comment?: string;
    }
    interface JSDocTag extends Node {
        parent: JSDoc | JSDocTypeLiteral;
        atToken: AtToken;
        tagName: Identifier;
        comment?: string;
    }
    interface JSDocUnknownTag extends JSDocTag {
        kind: SyntaxKind.JSDocTag;
    }
    /**
     * Note that `@extends` is a synonym of `@augments`.
     * Both tags are represented by this interface.
     */
    interface JSDocAugmentsTag extends JSDocTag {
        kind: SyntaxKind.JSDocAugmentsTag;
        class: ExpressionWithTypeArguments & {
            expression: Identifier | PropertyAccessEntityNameExpression;
        };
    }
    interface JSDocClassTag extends JSDocTag {
        kind: SyntaxKind.JSDocClassTag;
    }
    interface JSDocThisTag extends JSDocTag {
        kind: SyntaxKind.JSDocThisTag;
        typeExpression?: JSDocTypeExpression;
    }
    interface JSDocTemplateTag extends JSDocTag {
        kind: SyntaxKind.JSDocTemplateTag;
        typeParameters: NodeArray<TypeParameterDeclaration>;
    }
    interface JSDocReturnTag extends JSDocTag {
        kind: SyntaxKind.JSDocReturnTag;
        typeExpression?: JSDocTypeExpression;
    }
    interface JSDocTypeTag extends JSDocTag {
        kind: SyntaxKind.JSDocTypeTag;
        typeExpression?: JSDocTypeExpression;
    }
    interface JSDocTypedefTag extends JSDocTag, NamedDeclaration {
        parent: JSDoc;
        kind: SyntaxKind.JSDocTypedefTag;
        fullName?: JSDocNamespaceDeclaration | Identifier;
        name?: Identifier;
        typeExpression?: JSDocTypeExpression | JSDocTypeLiteral;
    }
    interface JSDocCallbackTag extends JSDocTag, NamedDeclaration {
        parent: JSDoc;
        kind: SyntaxKind.JSDocCallbackTag;
        fullName?: JSDocNamespaceDeclaration | Identifier;
        name?: Identifier;
        typeExpression: JSDocSignature;
    }
    interface JSDocSignature extends JSDocType, Declaration {
        kind: SyntaxKind.JSDocSignature;
        typeParameters?: ReadonlyArray<JSDocTemplateTag>;
        parameters: ReadonlyArray<JSDocParameterTag>;
        type: JSDocReturnTag | undefined;
    }
    interface JSDocPropertyLikeTag extends JSDocTag, Declaration {
        parent: JSDoc;
        name: EntityName;
        typeExpression?: JSDocTypeExpression;
        /** Whether the property name came before the type -- non-standard for JSDoc, but Typescript-like */
        isNameFirst: boolean;
        isBracketed: boolean;
    }
    interface JSDocPropertyTag extends JSDocPropertyLikeTag {
        kind: SyntaxKind.JSDocPropertyTag;
    }
    interface JSDocParameterTag extends JSDocPropertyLikeTag {
        kind: SyntaxKind.JSDocParameterTag;
    }
    interface JSDocTypeLiteral extends JSDocType {
        kind: SyntaxKind.JSDocTypeLiteral;
        jsDocPropertyTags?: ReadonlyArray<JSDocPropertyLikeTag>;
        /** If true, then this type literal represents an *array* of its type. */
        isArrayType?: boolean;
    }
    enum FlowFlags {
        Unreachable = 1,
        Start = 2,
        BranchLabel = 4,
        LoopLabel = 8,
        Assignment = 16,
        TrueCondition = 32,
        FalseCondition = 64,
        SwitchClause = 128,
        ArrayMutation = 256,
        Referenced = 512,
        Shared = 1024,
        PreFinally = 2048,
        AfterFinally = 4096,
        Label = 12,
        Condition = 96
    }
    interface FlowLock {
        locked?: boolean;
    }
    interface AfterFinallyFlow extends FlowNodeBase, FlowLock {
        antecedent: FlowNode;
    }
    interface PreFinallyFlow extends FlowNodeBase {
        antecedent: FlowNode;
        lock: FlowLock;
    }
    type FlowNode = AfterFinallyFlow | PreFinallyFlow | FlowStart | FlowLabel | FlowAssignment | FlowCondition | FlowSwitchClause | FlowArrayMutation;
    interface FlowNodeBase {
        flags: FlowFlags;
        id?: number;
    }
    interface FlowStart extends FlowNodeBase {
        container?: FunctionExpression | ArrowFunction | MethodDeclaration;
    }
    interface FlowLabel extends FlowNodeBase {
        antecedents: FlowNode[] | undefined;
    }
    interface FlowAssignment extends FlowNodeBase {
        node: Expression | VariableDeclaration | BindingElement;
        antecedent: FlowNode;
    }
    interface FlowCondition extends FlowNodeBase {
        expression: Expression;
        antecedent: FlowNode;
    }
    interface FlowSwitchClause extends FlowNodeBase {
        switchStatement: SwitchStatement;
        clauseStart: number;
        clauseEnd: number;
        antecedent: FlowNode;
    }
    interface FlowArrayMutation extends FlowNodeBase {
        node: CallExpression | BinaryExpression;
        antecedent: FlowNode;
    }
    type FlowType = Type | IncompleteType;
    interface IncompleteType {
        flags: TypeFlags;
        type: Type;
    }
    interface AmdDependency {
        path: string;
        name?: string;
    }
    interface SourceFile extends Declaration {
        kind: SyntaxKind.SourceFile;
        statements: NodeArray<Statement>;
        endOfFileToken: Token<SyntaxKind.EndOfFileToken>;
        fileName: string;
        text: string;
        amdDependencies: ReadonlyArray<AmdDependency>;
        moduleName?: string;
        referencedFiles: ReadonlyArray<FileReference>;
        typeReferenceDirectives: ReadonlyArray<FileReference>;
        libReferenceDirectives: ReadonlyArray<FileReference>;
        languageVariant: LanguageVariant;
        isDeclarationFile: boolean;
        /**
         * lib.d.ts should have a reference comment like
         *
         *  /// <reference no-default-lib="true"/>
         *
         * If any other file has this comment, it signals not to include lib.d.ts
         * because this containing file is intended to act as a default library.
         */
        hasNoDefaultLib: boolean;
        languageVersion: ScriptTarget;
    }
    interface Bundle extends Node {
        kind: SyntaxKind.Bundle;
        prepends: ReadonlyArray<InputFiles | UnparsedSource>;
        sourceFiles: ReadonlyArray<SourceFile>;
    }
    interface InputFiles extends Node {
        kind: SyntaxKind.InputFiles;
        javascriptText: string;
        javascriptMapPath?: string;
        javascriptMapText?: string;
        declarationText: string;
        declarationMapPath?: string;
        declarationMapText?: string;
    }
    interface UnparsedSource extends Node {
        kind: SyntaxKind.UnparsedSource;
        text: string;
        sourceMapPath?: string;
        sourceMapText?: string;
    }
    interface JsonSourceFile extends SourceFile {
        statements: NodeArray<JsonObjectExpressionStatement>;
    }
    interface TsConfigSourceFile extends JsonSourceFile {
        extendedSourceFiles?: string[];
    }
    interface JsonMinusNumericLiteral extends PrefixUnaryExpression {
        kind: SyntaxKind.PrefixUnaryExpression;
        operator: SyntaxKind.MinusToken;
        operand: NumericLiteral;
    }
    interface JsonObjectExpressionStatement extends ExpressionStatement {
        expression: ObjectLiteralExpression | ArrayLiteralExpression | JsonMinusNumericLiteral | NumericLiteral | StringLiteral | BooleanLiteral | NullLiteral;
    }
    interface ScriptReferenceHost {
        getCompilerOptions(): CompilerOptions;
        getSourceFile(fileName: string): SourceFile | undefined;
        getSourceFileByPath(path: Path): SourceFile | undefined;
        getCurrentDirectory(): string;
    }
    interface ParseConfigHost {
        useCaseSensitiveFileNames: boolean;
        readDirectory(rootDir: string, extensions: ReadonlyArray<string>, excludes: ReadonlyArray<string> | undefined, includes: ReadonlyArray<string>, depth?: number): string[];
        /**
         * Gets a value indicating whether the specified path exists and is a file.
         * @param path The path to test.
         */
        fileExists(path: string): boolean;
        readFile(path: string): string | undefined;
    }
    type WriteFileCallback = (fileName: string, data: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles?: ReadonlyArray<SourceFile>) => void;
    class OperationCanceledException {
    }
    interface CancellationToken {
        isCancellationRequested(): boolean;
        /** @throws OperationCanceledException if isCancellationRequested is true */
        throwIfCancellationRequested(): void;
    }
    interface Program extends ScriptReferenceHost {
        /**
         * Get a list of root file names that were passed to a 'createProgram'
         */
        getRootFileNames(): ReadonlyArray<string>;
        /**
         * Get a list of files in the program
         */
        getSourceFiles(): ReadonlyArray<SourceFile>;
        /**
         * Emits the JavaScript and declaration files.  If targetSourceFile is not specified, then
         * the JavaScript and declaration files will be produced for all the files in this program.
         * If targetSourceFile is specified, then only the JavaScript and declaration for that
         * specific file will be generated.
         *
         * If writeFile is not specified then the writeFile callback from the compiler host will be
         * used for writing the JavaScript and declaration files.  Otherwise, the writeFile parameter
         * will be invoked when writing the JavaScript and declaration files.
         */
        emit(targetSourceFile?: SourceFile, writeFile?: WriteFileCallback, cancellationToken?: CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: CustomTransformers): EmitResult;
        getOptionsDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getGlobalDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getSyntacticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<DiagnosticWithLocation>;
        /** The first time this is called, it will return global diagnostics (no location). */
        getSemanticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        getDeclarationDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<DiagnosticWithLocation>;
        getConfigFileParsingDiagnostics(): ReadonlyArray<Diagnostic>;
        /**
         * Gets a type checker that can be used to semantically analyze source files in the program.
         */
        getTypeChecker(): TypeChecker;
        isSourceFileFromExternalLibrary(file: SourceFile): boolean;
        getProjectReferences(): (ResolvedProjectReference | undefined)[] | undefined;
    }
    interface ResolvedProjectReference {
        commandLine: ParsedCommandLine;
        sourceFile: SourceFile;
    }
    interface CustomTransformers {
        /** Custom transformers to evaluate before built-in .js transformations. */
        before?: TransformerFactory<SourceFile>[];
        /** Custom transformers to evaluate after built-in .js transformations. */
        after?: TransformerFactory<SourceFile>[];
        /** Custom transformers to evaluate after built-in .d.ts transformations. */
        afterDeclarations?: TransformerFactory<Bundle | SourceFile>[];
    }
    interface SourceMapSpan {
        /** Line number in the .js file. */
        emittedLine: number;
        /** Column number in the .js file. */
        emittedColumn: number;
        /** Line number in the .ts file. */
        sourceLine: number;
        /** Column number in the .ts file. */
        sourceColumn: number;
        /** Optional name (index into names array) associated with this span. */
        nameIndex?: number;
        /** .ts file (index into sources array) associated with this span */
        sourceIndex: number;
    }
    interface SourceMapData {
        sourceMapFilePath: string;
        jsSourceMappingURL: string;
        sourceMapFile: string;
        sourceMapSourceRoot: string;
        sourceMapSources: string[];
        sourceMapSourcesContent?: (string | null)[];
        inputSourceFileNames: string[];
        sourceMapNames?: string[];
        sourceMapMappings: string;
        sourceMapDecodedMappings: SourceMapSpan[];
    }
    /** Return code used by getEmitOutput function to indicate status of the function */
    enum ExitStatus {
        Success = 0,
        DiagnosticsPresent_OutputsSkipped = 1,
        DiagnosticsPresent_OutputsGenerated = 2
    }
    interface EmitResult {
        emitSkipped: boolean;
        /** Contains declaration emit diagnostics */
        diagnostics: ReadonlyArray<Diagnostic>;
        emittedFiles?: string[];
    }
    interface TypeChecker {
        getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
        getDeclaredTypeOfSymbol(symbol: Symbol): Type;
        getPropertiesOfType(type: Type): Symbol[];
        getPropertyOfType(type: Type, propertyName: string): Symbol | undefined;
        getIndexInfoOfType(type: Type, kind: IndexKind): IndexInfo | undefined;
        getSignaturesOfType(type: Type, kind: SignatureKind): Signature[];
        getIndexTypeOfType(type: Type, kind: IndexKind): Type | undefined;
        getBaseTypes(type: InterfaceType): BaseType[];
        getBaseTypeOfLiteralType(type: Type): Type;
        getWidenedType(type: Type): Type;
        getReturnTypeOfSignature(signature: Signature): Type;
        getNullableType(type: Type, flags: TypeFlags): Type;
        getNonNullableType(type: Type): Type;
        /** Note that the resulting nodes cannot be checked. */
        typeToTypeNode(type: Type, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): TypeNode | undefined;
        /** Note that the resulting nodes cannot be checked. */
        signatureToSignatureDeclaration(signature: Signature, kind: SyntaxKind, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): (SignatureDeclaration & {
            typeArguments?: NodeArray<TypeNode>;
        }) | undefined;
        /** Note that the resulting nodes cannot be checked. */
        indexInfoToIndexSignatureDeclaration(indexInfo: IndexInfo, kind: IndexKind, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): IndexSignatureDeclaration | undefined;
        /** Note that the resulting nodes cannot be checked. */
        symbolToEntityName(symbol: Symbol, meaning: SymbolFlags, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): EntityName | undefined;
        /** Note that the resulting nodes cannot be checked. */
        symbolToExpression(symbol: Symbol, meaning: SymbolFlags, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): Expression | undefined;
        /** Note that the resulting nodes cannot be checked. */
        symbolToTypeParameterDeclarations(symbol: Symbol, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): NodeArray<TypeParameterDeclaration> | undefined;
        /** Note that the resulting nodes cannot be checked. */
        symbolToParameterDeclaration(symbol: Symbol, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): ParameterDeclaration | undefined;
        /** Note that the resulting nodes cannot be checked. */
        typeParameterToDeclaration(parameter: TypeParameter, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): TypeParameterDeclaration | undefined;
        getSymbolsInScope(location: Node, meaning: SymbolFlags): Symbol[];
        getSymbolAtLocation(node: Node): Symbol | undefined;
        getSymbolsOfParameterPropertyDeclaration(parameter: ParameterDeclaration, parameterName: string): Symbol[];
        /**
         * The function returns the value (local variable) symbol of an identifier in the short-hand property assignment.
         * This is necessary as an identifier in short-hand property assignment can contains two meaning: property name and property value.
         */
        getShorthandAssignmentValueSymbol(location: Node): Symbol | undefined;
        getExportSpecifierLocalTargetSymbol(location: ExportSpecifier): Symbol | undefined;
        /**
         * If a symbol is a local symbol with an associated exported symbol, returns the exported symbol.
         * Otherwise returns its input.
         * For example, at `export type T = number;`:
         *     - `getSymbolAtLocation` at the location `T` will return the exported symbol for `T`.
         *     - But the result of `getSymbolsInScope` will contain the *local* symbol for `T`, not the exported symbol.
         *     - Calling `getExportSymbolOfSymbol` on that local symbol will return the exported symbol.
         */
        getExportSymbolOfSymbol(symbol: Symbol): Symbol;
        getPropertySymbolOfDestructuringAssignment(location: Identifier): Symbol | undefined;
        getTypeAtLocation(node: Node): Type | undefined;
        getTypeFromTypeNode(node: TypeNode): Type;
        signatureToString(signature: Signature, enclosingDeclaration?: Node, flags?: TypeFormatFlags, kind?: SignatureKind): string;
        typeToString(type: Type, enclosingDeclaration?: Node, flags?: TypeFormatFlags): string;
        symbolToString(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags, flags?: SymbolFormatFlags): string;
        typePredicateToString(predicate: TypePredicate, enclosingDeclaration?: Node, flags?: TypeFormatFlags): string;
        /**
         * @deprecated Use the createX factory functions or XToY typechecker methods and `createPrinter` or the `xToString` methods instead
         * This will be removed in a future version.
         */
        getSymbolDisplayBuilder(): SymbolDisplayBuilder;
        getFullyQualifiedName(symbol: Symbol): string;
        getAugmentedPropertiesOfType(type: Type): Symbol[];
        getRootSymbols(symbol: Symbol): Symbol[];
        getContextualType(node: Expression): Type | undefined;
        /**
         * returns unknownSignature in the case of an error.
         * returns undefined if the node is not valid.
         * @param argumentCount Apparent number of arguments, passed in case of a possibly incomplete call. This should come from an ArgumentListInfo. See `signatureHelp.ts`.
         */
        getResolvedSignature(node: CallLikeExpression, candidatesOutArray?: Signature[], argumentCount?: number): Signature | undefined;
        getSignatureFromDeclaration(declaration: SignatureDeclaration): Signature | undefined;
        isImplementationOfOverload(node: SignatureDeclaration): boolean | undefined;
        isUndefinedSymbol(symbol: Symbol): boolean;
        isArgumentsSymbol(symbol: Symbol): boolean;
        isUnknownSymbol(symbol: Symbol): boolean;
        getConstantValue(node: EnumMember | PropertyAccessExpression | ElementAccessExpression): string | number | undefined;
        isValidPropertyAccess(node: PropertyAccessExpression | QualifiedName | ImportTypeNode, propertyName: string): boolean;
        /** Follow all aliases to get the original symbol. */
        getAliasedSymbol(symbol: Symbol): Symbol;
        getExportsOfModule(moduleSymbol: Symbol): Symbol[];
        getAllAttributesTypeFromJsxOpeningLikeElement(elementNode: JsxOpeningLikeElement): Type | undefined;
        getJsxIntrinsicTagNamesAt(location: Node): Symbol[];
        isOptionalParameter(node: ParameterDeclaration): boolean;
        getAmbientModules(): Symbol[];
        tryGetMemberInModuleExports(memberName: string, moduleSymbol: Symbol): Symbol | undefined;
        getApparentType(type: Type): Type;
        getSuggestionForNonexistentProperty(node: Identifier, containingType: Type): string | undefined;
        getSuggestionForNonexistentSymbol(location: Node, name: string, meaning: SymbolFlags): string | undefined;
        getSuggestionForNonexistentModule(node: Identifier, target: Symbol): string | undefined;
        getBaseConstraintOfType(type: Type): Type | undefined;
        getDefaultFromTypeParameter(type: Type): Type | undefined;
        /**
         * Depending on the operation performed, it may be appropriate to throw away the checker
         * if the cancellation token is triggered. Typically, if it is used for error checking
         * and the operation is cancelled, then it should be discarded, otherwise it is safe to keep.
         */
        runWithCancellationToken<T>(token: CancellationToken, cb: (checker: TypeChecker) => T): T;
    }
    enum NodeBuilderFlags {
        None = 0,
        NoTruncation = 1,
        WriteArrayAsGenericType = 2,
        GenerateNamesForShadowedTypeParams = 4,
        UseStructuralFallback = 8,
        ForbidIndexedAccessSymbolReferences = 16,
        WriteTypeArgumentsOfSignature = 32,
        UseFullyQualifiedType = 64,
        UseOnlyExternalAliasing = 128,
        SuppressAnyReturnType = 256,
        WriteTypeParametersInQualifiedName = 512,
        MultilineObjectLiterals = 1024,
        WriteClassExpressionAsTypeLiteral = 2048,
        UseTypeOfFunction = 4096,
        OmitParameterModifiers = 8192,
        UseAliasDefinedOutsideCurrentScope = 16384,
        AllowThisInObjectLiteral = 32768,
        AllowQualifedNameInPlaceOfIdentifier = 65536,
        AllowAnonymousIdentifier = 131072,
        AllowEmptyUnionOrIntersection = 262144,
        AllowEmptyTuple = 524288,
        AllowUniqueESSymbolType = 1048576,
        AllowEmptyIndexInfoType = 2097152,
        IgnoreErrors = 3112960,
        InObjectTypeLiteral = 4194304,
        InTypeAlias = 8388608,
        InInitialEntityName = 16777216,
        InReverseMappedType = 33554432
    }
    enum TypeFormatFlags {
        None = 0,
        NoTruncation = 1,
        WriteArrayAsGenericType = 2,
        UseStructuralFallback = 8,
        WriteTypeArgumentsOfSignature = 32,
        UseFullyQualifiedType = 64,
        SuppressAnyReturnType = 256,
        MultilineObjectLiterals = 1024,
        WriteClassExpressionAsTypeLiteral = 2048,
        UseTypeOfFunction = 4096,
        OmitParameterModifiers = 8192,
        UseAliasDefinedOutsideCurrentScope = 16384,
        AllowUniqueESSymbolType = 1048576,
        AddUndefined = 131072,
        WriteArrowStyleSignature = 262144,
        InArrayType = 524288,
        InElementType = 2097152,
        InFirstTypeArgument = 4194304,
        InTypeAlias = 8388608,
        /** @deprecated */ WriteOwnNameForAnyLike = 0,
        NodeBuilderFlagsMask = 9469291
    }
    enum SymbolFormatFlags {
        None = 0,
        WriteTypeParametersOrArguments = 1,
        UseOnlyExternalAliasing = 2,
        AllowAnyNodeKind = 4,
        UseAliasDefinedOutsideCurrentScope = 8
    }
    /**
     * @deprecated
     */
    interface SymbolDisplayBuilder {
        /** @deprecated */ buildTypeDisplay(type: Type, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildSymbolDisplay(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, meaning?: SymbolFlags, flags?: SymbolFormatFlags): void;
        /** @deprecated */ buildSignatureDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags, kind?: SignatureKind): void;
        /** @deprecated */ buildIndexSignatureDisplay(info: IndexInfo, writer: SymbolWriter, kind: IndexKind, enclosingDeclaration?: Node, globalFlags?: TypeFormatFlags, symbolStack?: Symbol[]): void;
        /** @deprecated */ buildParameterDisplay(parameter: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildTypeParameterDisplay(tp: TypeParameter, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildTypePredicateDisplay(predicate: TypePredicate, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildTypeParameterDisplayFromSymbol(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildDisplayForParametersAndDelimiters(thisParameter: Symbol, parameters: Symbol[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildDisplayForTypeParametersAndDelimiters(typeParameters: TypeParameter[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        /** @deprecated */ buildReturnTypeDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
    }
    /**
     * @deprecated Migrate to other methods of generating symbol names, ex symbolToEntityName + a printer or symbolToString
     */
    interface SymbolWriter extends SymbolTracker {
        writeKeyword(text: string): void;
        writeOperator(text: string): void;
        writePunctuation(text: string): void;
        writeSpace(text: string): void;
        writeStringLiteral(text: string): void;
        writeParameter(text: string): void;
        writeProperty(text: string): void;
        writeSymbol(text: string, symbol: Symbol): void;
        writeLine(): void;
        increaseIndent(): void;
        decreaseIndent(): void;
        clear(): void;
    }
    enum TypePredicateKind {
        This = 0,
        Identifier = 1
    }
    interface TypePredicateBase {
        kind: TypePredicateKind;
        type: Type;
    }
    interface ThisTypePredicate extends TypePredicateBase {
        kind: TypePredicateKind.This;
    }
    interface IdentifierTypePredicate extends TypePredicateBase {
        kind: TypePredicateKind.Identifier;
        parameterName: string;
        parameterIndex: number;
    }
    type TypePredicate = IdentifierTypePredicate | ThisTypePredicate;
    enum SymbolFlags {
        None = 0,
        FunctionScopedVariable = 1,
        BlockScopedVariable = 2,
        Property = 4,
        EnumMember = 8,
        Function = 16,
        Class = 32,
        Interface = 64,
        ConstEnum = 128,
        RegularEnum = 256,
        ValueModule = 512,
        NamespaceModule = 1024,
        TypeLiteral = 2048,
        ObjectLiteral = 4096,
        Method = 8192,
        Constructor = 16384,
        GetAccessor = 32768,
        SetAccessor = 65536,
        Signature = 131072,
        TypeParameter = 262144,
        TypeAlias = 524288,
        ExportValue = 1048576,
        Alias = 2097152,
        Prototype = 4194304,
        ExportStar = 8388608,
        Optional = 16777216,
        Transient = 33554432,
        JSContainer = 67108864,
        Enum = 384,
        Variable = 3,
        Value = 67216319,
        Type = 67901928,
        Namespace = 1920,
        Module = 1536,
        Accessor = 98304,
        FunctionScopedVariableExcludes = 67216318,
        BlockScopedVariableExcludes = 67216319,
        ParameterExcludes = 67216319,
        PropertyExcludes = 0,
        EnumMemberExcludes = 68008959,
        FunctionExcludes = 67215791,
        ClassExcludes = 68008383,
        InterfaceExcludes = 67901832,
        RegularEnumExcludes = 68008191,
        ConstEnumExcludes = 68008831,
        ValueModuleExcludes = 67215503,
        NamespaceModuleExcludes = 0,
        MethodExcludes = 67208127,
        GetAccessorExcludes = 67150783,
        SetAccessorExcludes = 67183551,
        TypeParameterExcludes = 67639784,
        TypeAliasExcludes = 67901928,
        AliasExcludes = 2097152,
        ModuleMember = 2623475,
        ExportHasLocal = 944,
        HasExports = 1955,
        HasMembers = 6240,
        BlockScoped = 418,
        PropertyOrAccessor = 98308,
        ClassMember = 106500
    }
    interface Symbol {
        flags: SymbolFlags;
        escapedName: __String;
        declarations: Declaration[];
        valueDeclaration: Declaration;
        members?: SymbolTable;
        exports?: SymbolTable;
        globalExports?: SymbolTable;
    }
    enum InternalSymbolName {
        Call = "__call",
        Constructor = "__constructor",
        New = "__new",
        Index = "__index",
        ExportStar = "__export",
        Global = "__global",
        Missing = "__missing",
        Type = "__type",
        Object = "__object",
        JSXAttributes = "__jsxAttributes",
        Class = "__class",
        Function = "__function",
        Computed = "__computed",
        Resolving = "__resolving__",
        ExportEquals = "export=",
        Default = "default"
    }
    /**
     * This represents a string whose leading underscore have been escaped by adding extra leading underscores.
     * The shape of this brand is rather unique compared to others we've used.
     * Instead of just an intersection of a string and an object, it is that union-ed
     * with an intersection of void and an object. This makes it wholly incompatible
     * with a normal string (which is good, it cannot be misused on assignment or on usage),
     * while still being comparable with a normal string via === (also good) and castable from a string.
     */
    type __String = (string & {
        __escapedIdentifier: void;
    }) | (void & {
        __escapedIdentifier: void;
    }) | InternalSymbolName;
    /** ReadonlyMap where keys are `__String`s. */
    interface ReadonlyUnderscoreEscapedMap<T> {
        get(key: __String): T | undefined;
        has(key: __String): boolean;
        forEach(action: (value: T, key: __String) => void): void;
        readonly size: number;
        keys(): Iterator<__String>;
        values(): Iterator<T>;
        entries(): Iterator<[__String, T]>;
    }
    /** Map where keys are `__String`s. */
    interface UnderscoreEscapedMap<T> extends ReadonlyUnderscoreEscapedMap<T> {
        set(key: __String, value: T): this;
        delete(key: __String): boolean;
        clear(): void;
    }
    /** SymbolTable based on ES6 Map interface. */
    type SymbolTable = UnderscoreEscapedMap<Symbol>;
    enum TypeFlags {
        Any = 1,
        Unknown = 2,
        String = 4,
        Number = 8,
        Boolean = 16,
        Enum = 32,
        StringLiteral = 64,
        NumberLiteral = 128,
        BooleanLiteral = 256,
        EnumLiteral = 512,
        ESSymbol = 1024,
        UniqueESSymbol = 2048,
        Void = 4096,
        Undefined = 8192,
        Null = 16384,
        Never = 32768,
        TypeParameter = 65536,
        Object = 131072,
        Union = 262144,
        Intersection = 524288,
        Index = 1048576,
        IndexedAccess = 2097152,
        Conditional = 4194304,
        Substitution = 8388608,
        NonPrimitive = 16777216,
        Literal = 448,
        Unit = 27072,
        StringOrNumberLiteral = 192,
        PossiblyFalsy = 29148,
        StringLike = 68,
        NumberLike = 168,
        BooleanLike = 272,
        EnumLike = 544,
        ESSymbolLike = 3072,
        VoidLike = 12288,
        UnionOrIntersection = 786432,
        StructuredType = 917504,
        TypeVariable = 2162688,
        InstantiableNonPrimitive = 14745600,
        InstantiablePrimitive = 1048576,
        Instantiable = 15794176,
        StructuredOrInstantiable = 16711680,
        Narrowable = 33492479,
        NotUnionOrUnit = 16909315
    }
    type DestructuringPattern = BindingPattern | ObjectLiteralExpression | ArrayLiteralExpression;
    interface Type {
        flags: TypeFlags;
        symbol: Symbol;
        pattern?: DestructuringPattern;
        aliasSymbol?: Symbol;
        aliasTypeArguments?: Type[];
    }
    interface LiteralType extends Type {
        value: string | number;
        freshType: LiteralType;
        regularType: LiteralType;
    }
    interface UniqueESSymbolType extends Type {
        symbol: Symbol;
    }
    interface StringLiteralType extends LiteralType {
        value: string;
    }
    interface NumberLiteralType extends LiteralType {
        value: number;
    }
    interface EnumType extends Type {
    }
    enum ObjectFlags {
        Class = 1,
        Interface = 2,
        Reference = 4,
        Tuple = 8,
        Anonymous = 16,
        Mapped = 32,
        Instantiated = 64,
        ObjectLiteral = 128,
        EvolvingArray = 256,
        ObjectLiteralPatternWithComputedProperties = 512,
        ContainsSpread = 1024,
        ReverseMapped = 2048,
        JsxAttributes = 4096,
        MarkerType = 8192,
        ClassOrInterface = 3
    }
    interface ObjectType extends Type {
        objectFlags: ObjectFlags;
    }
    /** Class and interface types (ObjectFlags.Class and ObjectFlags.Interface). */
    interface InterfaceType extends ObjectType {
        typeParameters: TypeParameter[] | undefined;
        outerTypeParameters: TypeParameter[] | undefined;
        localTypeParameters: TypeParameter[] | undefined;
        thisType: TypeParameter | undefined;
    }
    type BaseType = ObjectType | IntersectionType;
    interface InterfaceTypeWithDeclaredMembers extends InterfaceType {
        declaredProperties: Symbol[];
        declaredCallSignatures: Signature[];
        declaredConstructSignatures: Signature[];
        declaredStringIndexInfo?: IndexInfo;
        declaredNumberIndexInfo?: IndexInfo;
    }
    /**
     * Type references (ObjectFlags.Reference). When a class or interface has type parameters or
     * a "this" type, references to the class or interface are made using type references. The
     * typeArguments property specifies the types to substitute for the type parameters of the
     * class or interface and optionally includes an extra element that specifies the type to
     * substitute for "this" in the resulting instantiation. When no extra argument is present,
     * the type reference itself is substituted for "this". The typeArguments property is undefined
     * if the class or interface has no type parameters and the reference isn't specifying an
     * explicit "this" argument.
     */
    interface TypeReference extends ObjectType {
        target: GenericType;
        typeArguments?: Type[];
    }
    interface GenericType extends InterfaceType, TypeReference {
    }
    interface UnionOrIntersectionType extends Type {
        types: Type[];
    }
    interface UnionType extends UnionOrIntersectionType {
    }
    interface IntersectionType extends UnionOrIntersectionType {
    }
    type StructuredType = ObjectType | UnionType | IntersectionType;
    interface EvolvingArrayType extends ObjectType {
        elementType: Type;
        finalArrayType?: Type;
    }
    interface InstantiableType extends Type {
    }
    interface TypeParameter extends InstantiableType {
    }
    interface IndexedAccessType extends InstantiableType {
        objectType: Type;
        indexType: Type;
        constraint?: Type;
        simplified?: Type;
    }
    type TypeVariable = TypeParameter | IndexedAccessType;
    interface IndexType extends InstantiableType {
        type: InstantiableType | UnionOrIntersectionType;
    }
    interface ConditionalRoot {
        node: ConditionalTypeNode;
        checkType: Type;
        extendsType: Type;
        trueType: Type;
        falseType: Type;
        isDistributive: boolean;
        inferTypeParameters?: TypeParameter[];
        outerTypeParameters?: TypeParameter[];
        instantiations?: Map<Type>;
        aliasSymbol?: Symbol;
        aliasTypeArguments?: Type[];
    }
    interface ConditionalType extends InstantiableType {
        root: ConditionalRoot;
        checkType: Type;
        extendsType: Type;
        resolvedTrueType?: Type;
        resolvedFalseType?: Type;
    }
    interface SubstitutionType extends InstantiableType {
        typeVariable: TypeVariable;
        substitute: Type;
    }
    enum SignatureKind {
        Call = 0,
        Construct = 1
    }
    interface Signature {
        declaration?: SignatureDeclaration | JSDocSignature;
        typeParameters?: TypeParameter[];
        parameters: Symbol[];
    }
    enum IndexKind {
        String = 0,
        Number = 1
    }
    interface IndexInfo {
        type: Type;
        isReadonly: boolean;
        declaration?: IndexSignatureDeclaration;
    }
    enum InferencePriority {
        NakedTypeVariable = 1,
        HomomorphicMappedType = 2,
        MappedTypeConstraint = 4,
        ReturnType = 8,
        LiteralKeyof = 16,
        NoConstraints = 32,
        AlwaysStrict = 64,
        PriorityImpliesCombination = 28
    }
    /** @deprecated Use FileExtensionInfo instead. */
    type JsFileExtensionInfo = FileExtensionInfo;
    interface FileExtensionInfo {
        extension: string;
        isMixedContent: boolean;
        scriptKind?: ScriptKind;
    }
    interface DiagnosticMessage {
        key: string;
        category: DiagnosticCategory;
        code: number;
        message: string;
        reportsUnnecessary?: {};
    }
    /**
     * A linked list of formatted diagnostic messages to be used as part of a multiline message.
     * It is built from the bottom up, leaving the head to be the "main" diagnostic.
     * While it seems that DiagnosticMessageChain is structurally similar to DiagnosticMessage,
     * the difference is that messages are all preformatted in DMC.
     */
    interface DiagnosticMessageChain {
        messageText: string;
        category: DiagnosticCategory;
        code: number;
        next?: DiagnosticMessageChain;
    }
    interface Diagnostic {
        file: SourceFile | undefined;
        start: number | undefined;
        length: number | undefined;
        messageText: string | DiagnosticMessageChain;
        category: DiagnosticCategory;
        /** May store more in future. For now, this will simply be `true` to indicate when a diagnostic is an unused-identifier diagnostic. */
        reportsUnnecessary?: {};
        code: number;
        source?: string;
    }
    interface DiagnosticWithLocation extends Diagnostic {
        file: SourceFile;
        start: number;
        length: number;
    }
    enum DiagnosticCategory {
        Warning = 0,
        Error = 1,
        Suggestion = 2,
        Message = 3
    }
    enum ModuleResolutionKind {
        Classic = 1,
        NodeJs = 2
    }
    interface PluginImport {
        name: string;
    }
    interface ProjectReference {
        /** A normalized path on disk */
        path: string;
        /** The path as the user originally wrote it */
        originalPath?: string;
        /** True if the output of this reference should be prepended to the output of this project. Only valid for --outFile compilations */
        prepend?: boolean;
        /** True if it is intended that this reference form a circularity */
        circular?: boolean;
    }
    type CompilerOptionsValue = string | number | boolean | (string | number)[] | string[] | MapLike<string[]> | PluginImport[] | ProjectReference[] | null | undefined;
    interface CompilerOptions {
        allowJs?: boolean;
        allowSyntheticDefaultImports?: boolean;
        allowUnreachableCode?: boolean;
        allowUnusedLabels?: boolean;
        alwaysStrict?: boolean;
        baseUrl?: string;
        charset?: string;
        checkJs?: boolean;
        declaration?: boolean;
        declarationMap?: boolean;
        emitDeclarationOnly?: boolean;
        declarationDir?: string;
        disableSizeLimit?: boolean;
        downlevelIteration?: boolean;
        emitBOM?: boolean;
        emitDecoratorMetadata?: boolean;
        experimentalDecorators?: boolean;
        forceConsistentCasingInFileNames?: boolean;
        importHelpers?: boolean;
        inlineSourceMap?: boolean;
        inlineSources?: boolean;
        isolatedModules?: boolean;
        jsx?: JsxEmit;
        keyofStringsOnly?: boolean;
        lib?: string[];
        locale?: string;
        mapRoot?: string;
        maxNodeModuleJsDepth?: number;
        module?: ModuleKind;
        moduleResolution?: ModuleResolutionKind;
        newLine?: NewLineKind;
        noEmit?: boolean;
        noEmitHelpers?: boolean;
        noEmitOnError?: boolean;
        noErrorTruncation?: boolean;
        noFallthroughCasesInSwitch?: boolean;
        noImplicitAny?: boolean;
        noImplicitReturns?: boolean;
        noImplicitThis?: boolean;
        noStrictGenericChecks?: boolean;
        noUnusedLocals?: boolean;
        noUnusedParameters?: boolean;
        noImplicitUseStrict?: boolean;
        noLib?: boolean;
        noResolve?: boolean;
        out?: string;
        outDir?: string;
        outFile?: string;
        paths?: MapLike<string[]>;
        preserveConstEnums?: boolean;
        preserveSymlinks?: boolean;
        project?: string;
        reactNamespace?: string;
        jsxFactory?: string;
        composite?: boolean;
        removeComments?: boolean;
        rootDir?: string;
        rootDirs?: string[];
        skipLibCheck?: boolean;
        skipDefaultLibCheck?: boolean;
        sourceMap?: boolean;
        sourceRoot?: string;
        strict?: boolean;
        strictFunctionTypes?: boolean;
        strictNullChecks?: boolean;
        strictPropertyInitialization?: boolean;
        suppressExcessPropertyErrors?: boolean;
        suppressImplicitAnyIndexErrors?: boolean;
        target?: ScriptTarget;
        traceResolution?: boolean;
        resolveJsonModule?: boolean;
        types?: string[];
        /** Paths used to compute primary types search locations */
        typeRoots?: string[];
        esModuleInterop?: boolean;
        [option: string]: CompilerOptionsValue | TsConfigSourceFile | undefined;
    }
    interface TypeAcquisition {
        enableAutoDiscovery?: boolean;
        enable?: boolean;
        include?: string[];
        exclude?: string[];
        [option: string]: string[] | boolean | undefined;
    }
    enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
        UMD = 3,
        System = 4,
        ES2015 = 5,
        ESNext = 6
    }
    enum JsxEmit {
        None = 0,
        Preserve = 1,
        React = 2,
        ReactNative = 3
    }
    enum NewLineKind {
        CarriageReturnLineFeed = 0,
        LineFeed = 1
    }
    interface LineAndCharacter {
        /** 0-based. */
        line: number;
        character: number;
    }
    enum ScriptKind {
        Unknown = 0,
        JS = 1,
        JSX = 2,
        TS = 3,
        TSX = 4,
        External = 5,
        JSON = 6,
        /**
         * Used on extensions that doesn't define the ScriptKind but the content defines it.
         * Deferred extensions are going to be included in all project contexts.
         */
        Deferred = 7
    }
    enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES2015 = 2,
        ES2016 = 3,
        ES2017 = 4,
        ES2018 = 5,
        ESNext = 6,
        JSON = 100,
        Latest = 6
    }
    enum LanguageVariant {
        Standard = 0,
        JSX = 1
    }
    /** Either a parsed command line or a parsed tsconfig.json */
    interface ParsedCommandLine {
        options: CompilerOptions;
        typeAcquisition?: TypeAcquisition;
        fileNames: string[];
        projectReferences?: ReadonlyArray<ProjectReference>;
        raw?: any;
        errors: Diagnostic[];
        wildcardDirectories?: MapLike<WatchDirectoryFlags>;
        compileOnSave?: boolean;
    }
    enum WatchDirectoryFlags {
        None = 0,
        Recursive = 1
    }
    interface ExpandResult {
        fileNames: string[];
        projectReferences: ReadonlyArray<ProjectReference> | undefined;
        wildcardDirectories: MapLike<WatchDirectoryFlags>;
    }
    interface CreateProgramOptions {
        rootNames: ReadonlyArray<string>;
        options: CompilerOptions;
        projectReferences?: ReadonlyArray<ProjectReference>;
        host?: CompilerHost;
        oldProgram?: Program;
        configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>;
    }
    interface ModuleResolutionHost {
        fileExists(fileName: string): boolean;
        readFile(fileName: string): string | undefined;
        trace?(s: string): void;
        directoryExists?(directoryName: string): boolean;
        /**
         * Resolve a symbolic link.
         * @see https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options
         */
        realpath?(path: string): string;
        getCurrentDirectory?(): string;
        getDirectories?(path: string): string[];
    }
    /**
     * Represents the result of module resolution.
     * Module resolution will pick up tsx/jsx/js files even if '--jsx' and '--allowJs' are turned off.
     * The Program will then filter results based on these flags.
     *
     * Prefer to return a `ResolvedModuleFull` so that the file type does not have to be inferred.
     */
    interface ResolvedModule {
        /** Path of the file the module was resolved to. */
        resolvedFileName: string;
        /** True if `resolvedFileName` comes from `node_modules`. */
        isExternalLibraryImport?: boolean;
    }
    /**
     * ResolvedModule with an explicitly provided `extension` property.
     * Prefer this over `ResolvedModule`.
     * If changing this, remember to change `moduleResolutionIsEqualTo`.
     */
    interface ResolvedModuleFull extends ResolvedModule {
        /**
         * Extension of resolvedFileName. This must match what's at the end of resolvedFileName.
         * This is optional for backwards-compatibility, but will be added if not provided.
         */
        extension: Extension;
        packageId?: PackageId;
    }
    /**
     * Unique identifier with a package name and version.
     * If changing this, remember to change `packageIdIsEqual`.
     */
    interface PackageId {
        /**
         * Name of the package.
         * Should not include `@types`.
         * If accessing a non-index file, this should include its name e.g. "foo/bar".
         */
        name: string;
        /**
         * Name of a submodule within this package.
         * May be "".
         */
        subModuleName: string;
        /** Version of the package, e.g. "1.2.3" */
        version: string;
    }
    enum Extension {
        Ts = ".ts",
        Tsx = ".tsx",
        Dts = ".d.ts",
        Js = ".js",
        Jsx = ".jsx",
        Json = ".json"
    }
    interface ResolvedModuleWithFailedLookupLocations {
        readonly resolvedModule: ResolvedModuleFull | undefined;
    }
    interface ResolvedTypeReferenceDirective {
        primary: boolean;
        resolvedFileName: string | undefined;
        packageId?: PackageId;
    }
    interface ResolvedTypeReferenceDirectiveWithFailedLookupLocations {
        readonly resolvedTypeReferenceDirective: ResolvedTypeReferenceDirective | undefined;
        readonly failedLookupLocations: ReadonlyArray<string>;
    }
    interface CompilerHost extends ModuleResolutionHost {
        getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): SourceFile | undefined;
        getSourceFileByPath?(fileName: string, path: Path, languageVersion: ScriptTarget, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): SourceFile | undefined;
        getCancellationToken?(): CancellationToken;
        getDefaultLibFileName(options: CompilerOptions): string;
        getDefaultLibLocation?(): string;
        writeFile: WriteFileCallback;
        getCurrentDirectory(): string;
        getDirectories(path: string): string[];
        getCanonicalFileName(fileName: string): string;
        useCaseSensitiveFileNames(): boolean;
        getNewLine(): string;
        readDirectory?(rootDir: string, extensions: ReadonlyArray<string>, excludes: ReadonlyArray<string> | undefined, includes: ReadonlyArray<string>, depth?: number): string[];
        resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames?: string[]): (ResolvedModule | undefined)[];
        /**
         * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
         */
        resolveTypeReferenceDirectives?(typeReferenceDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        getEnvironmentVariable?(name: string): string | undefined;
        createHash?(data: string): string;
        getModifiedTime?(fileName: string): Date;
        setModifiedTime?(fileName: string, date: Date): void;
        deleteFile?(fileName: string): void;
    }
    interface SourceMapRange extends TextRange {
        source?: SourceMapSource;
    }
    interface SourceMapSource {
        fileName: string;
        text: string;
        skipTrivia?: (pos: number) => number;
    }
    enum EmitFlags {
        None = 0,
        SingleLine = 1,
        AdviseOnEmitNode = 2,
        NoSubstitution = 4,
        CapturesThis = 8,
        NoLeadingSourceMap = 16,
        NoTrailingSourceMap = 32,
        NoSourceMap = 48,
        NoNestedSourceMaps = 64,
        NoTokenLeadingSourceMaps = 128,
        NoTokenTrailingSourceMaps = 256,
        NoTokenSourceMaps = 384,
        NoLeadingComments = 512,
        NoTrailingComments = 1024,
        NoComments = 1536,
        NoNestedComments = 2048,
        HelperName = 4096,
        ExportName = 8192,
        LocalName = 16384,
        InternalName = 32768,
        Indented = 65536,
        NoIndentation = 131072,
        AsyncFunctionBody = 262144,
        ReuseTempVariableScope = 524288,
        CustomPrologue = 1048576,
        NoHoisting = 2097152,
        HasEndOfDeclarationMarker = 4194304,
        Iterator = 8388608,
        NoAsciiEscaping = 16777216
    }
    interface EmitHelper {
        readonly name: string;
        readonly scoped: boolean;
        readonly text: string | ((node: EmitHelperUniqueNameCallback) => string);
        readonly priority?: number;
    }
    type EmitHelperUniqueNameCallback = (name: string) => string;
    enum EmitHint {
        SourceFile = 0,
        Expression = 1,
        IdentifierName = 2,
        MappedTypeParameter = 3,
        Unspecified = 4
    }
    interface TransformationContext {
        /** Gets the compiler options supplied to the transformer. */
        getCompilerOptions(): CompilerOptions;
        /** Starts a new lexical environment. */
        startLexicalEnvironment(): void;
        /** Suspends the current lexical environment, usually after visiting a parameter list. */
        suspendLexicalEnvironment(): void;
        /** Resumes a suspended lexical environment, usually before visiting a function body. */
        resumeLexicalEnvironment(): void;
        /** Ends a lexical environment, returning any declarations. */
        endLexicalEnvironment(): Statement[] | undefined;
        /** Hoists a function declaration to the containing scope. */
        hoistFunctionDeclaration(node: FunctionDeclaration): void;
        /** Hoists a variable declaration to the containing scope. */
        hoistVariableDeclaration(node: Identifier): void;
        /** Records a request for a non-scoped emit helper in the current context. */
        requestEmitHelper(helper: EmitHelper): void;
        /** Gets and resets the requested non-scoped emit helpers. */
        readEmitHelpers(): EmitHelper[] | undefined;
        /** Enables expression substitutions in the pretty printer for the provided SyntaxKind. */
        enableSubstitution(kind: SyntaxKind): void;
        /** Determines whether expression substitutions are enabled for the provided node. */
        isSubstitutionEnabled(node: Node): boolean;
        /**
         * Hook used by transformers to substitute expressions just before they
         * are emitted by the pretty printer.
         *
         * NOTE: Transformation hooks should only be modified during `Transformer` initialization,
         * before returning the `NodeTransformer` callback.
         */
        onSubstituteNode: (hint: EmitHint, node: Node) => Node;
        /**
         * Enables before/after emit notifications in the pretty printer for the provided
         * SyntaxKind.
         */
        enableEmitNotification(kind: SyntaxKind): void;
        /**
         * Determines whether before/after emit notifications should be raised in the pretty
         * printer when it emits a node.
         */
        isEmitNotificationEnabled(node: Node): boolean;
        /**
         * Hook used to allow transformers to capture state before or after
         * the printer emits a node.
         *
         * NOTE: Transformation hooks should only be modified during `Transformer` initialization,
         * before returning the `NodeTransformer` callback.
         */
        onEmitNode: (hint: EmitHint, node: Node, emitCallback: (hint: EmitHint, node: Node) => void) => void;
    }
    interface TransformationResult<T extends Node> {
        /** Gets the transformed source files. */
        transformed: T[];
        /** Gets diagnostics for the transformation. */
        diagnostics?: DiagnosticWithLocation[];
        /**
         * Gets a substitute for a node, if one is available; otherwise, returns the original node.
         *
         * @param hint A hint as to the intended usage of the node.
         * @param node The node to substitute.
         */
        substituteNode(hint: EmitHint, node: Node): Node;
        /**
         * Emits a node with possible notification.
         *
         * @param hint A hint as to the intended usage of the node.
         * @param node The node to emit.
         * @param emitCallback A callback used to emit the node.
         */
        emitNodeWithNotification(hint: EmitHint, node: Node, emitCallback: (hint: EmitHint, node: Node) => void): void;
        /**
         * Clean up EmitNode entries on any parse-tree nodes.
         */
        dispose(): void;
    }
    /**
     * A function that is used to initialize and return a `Transformer` callback, which in turn
     * will be used to transform one or more nodes.
     */
    type TransformerFactory<T extends Node> = (context: TransformationContext) => Transformer<T>;
    /**
     * A function that transforms a node.
     */
    type Transformer<T extends Node> = (node: T) => T;
    /**
     * A function that accepts and possibly transforms a node.
     */
    type Visitor = (node: Node) => VisitResult<Node>;
    type VisitResult<T extends Node> = T | T[] | undefined;
    interface Printer {
        /**
         * Print a node and its subtree as-is, without any emit transformations.
         * @param hint A value indicating the purpose of a node. This is primarily used to
         * distinguish between an `Identifier` used in an expression position, versus an
         * `Identifier` used as an `IdentifierName` as part of a declaration. For most nodes you
         * should just pass `Unspecified`.
         * @param node The node to print. The node and its subtree are printed as-is, without any
         * emit transformations.
         * @param sourceFile A source file that provides context for the node. The source text of
         * the file is used to emit the original source content for literals and identifiers, while
         * the identifiers of the source file are used when generating unique names to avoid
         * collisions.
         */
        printNode(hint: EmitHint, node: Node, sourceFile: SourceFile): string;
        /**
         * Prints a list of nodes using the given format flags
         */
        printList<T extends Node>(format: ListFormat, list: NodeArray<T>, sourceFile: SourceFile): string;
        /**
         * Prints a source file as-is, without any emit transformations.
         */
        printFile(sourceFile: SourceFile): string;
        /**
         * Prints a bundle of source files as-is, without any emit transformations.
         */
        printBundle(bundle: Bundle): string;
    }
    interface PrintHandlers {
        /**
         * A hook used by the Printer when generating unique names to avoid collisions with
         * globally defined names that exist outside of the current source file.
         */
        hasGlobalName?(name: string): boolean;
        /**
         * A hook used by the Printer to provide notifications prior to emitting a node. A
         * compatible implementation **must** invoke `emitCallback` with the provided `hint` and
         * `node` values.
         * @param hint A hint indicating the intended purpose of the node.
         * @param node The node to emit.
         * @param emitCallback A callback that, when invoked, will emit the node.
         * @example
         * ```ts
         * var printer = createPrinter(printerOptions, {
         *   onEmitNode(hint, node, emitCallback) {
         *     // set up or track state prior to emitting the node...
         *     emitCallback(hint, node);
         *     // restore state after emitting the node...
         *   }
         * });
         * ```
         */
        onEmitNode?(hint: EmitHint, node: Node | undefined, emitCallback: (hint: EmitHint, node: Node | undefined) => void): void;
        /**
         * A hook used by the Printer to perform just-in-time substitution of a node. This is
         * primarily used by node transformations that need to substitute one node for another,
         * such as replacing `myExportedVar` with `exports.myExportedVar`.
         * @param hint A hint indicating the intended purpose of the node.
         * @param node The node to emit.
         * @example
         * ```ts
         * var printer = createPrinter(printerOptions, {
         *   substituteNode(hint, node) {
         *     // perform substitution if necessary...
         *     return node;
         *   }
         * });
         * ```
         */
        substituteNode?(hint: EmitHint, node: Node): Node;
    }
    interface PrinterOptions {
        removeComments?: boolean;
        newLine?: NewLineKind;
        omitTrailingSemicolon?: boolean;
        noEmitHelpers?: boolean;
    }
    interface GetEffectiveTypeRootsHost {
        directoryExists?(directoryName: string): boolean;
        getCurrentDirectory?(): string;
    }
    /** @deprecated See comment on SymbolWriter */
    interface SymbolTracker {
        trackSymbol?(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags): void;
        reportInaccessibleThisError?(): void;
        reportPrivateInBaseOfClassExpression?(propertyName: string): void;
        reportInaccessibleUniqueSymbolError?(): void;
    }
    interface TextSpan {
        start: number;
        length: number;
    }
    interface TextChangeRange {
        span: TextSpan;
        newLength: number;
    }
    interface SyntaxList extends Node {
        _children: Node[];
    }
    enum ListFormat {
        None = 0,
        SingleLine = 0,
        MultiLine = 1,
        PreserveLines = 2,
        LinesMask = 3,
        NotDelimited = 0,
        BarDelimited = 4,
        AmpersandDelimited = 8,
        CommaDelimited = 16,
        DelimitersMask = 28,
        AllowTrailingComma = 32,
        Indented = 64,
        SpaceBetweenBraces = 128,
        SpaceBetweenSiblings = 256,
        Braces = 512,
        Parenthesis = 1024,
        AngleBrackets = 2048,
        SquareBrackets = 4096,
        BracketsMask = 7680,
        OptionalIfUndefined = 8192,
        OptionalIfEmpty = 16384,
        Optional = 24576,
        PreferNewLine = 32768,
        NoTrailingNewLine = 65536,
        NoInterveningComments = 131072,
        NoSpaceIfEmpty = 262144,
        SingleElement = 524288,
        Modifiers = 131328,
        HeritageClauses = 256,
        SingleLineTypeLiteralMembers = 384,
        MultiLineTypeLiteralMembers = 16449,
        TupleTypeElements = 272,
        UnionTypeConstituents = 260,
        IntersectionTypeConstituents = 264,
        ObjectBindingPatternElements = 262576,
        ArrayBindingPatternElements = 262448,
        ObjectLiteralExpressionProperties = 263122,
        ArrayLiteralExpressionElements = 4466,
        CommaListElements = 272,
        CallExpressionArguments = 1296,
        NewExpressionArguments = 9488,
        TemplateExpressionSpans = 131072,
        SingleLineBlockStatements = 384,
        MultiLineBlockStatements = 65,
        VariableDeclarationList = 272,
        SingleLineFunctionBodyStatements = 384,
        MultiLineFunctionBodyStatements = 1,
        ClassHeritageClauses = 0,
        ClassMembers = 65,
        InterfaceMembers = 65,
        EnumMembers = 81,
        CaseBlockClauses = 65,
        NamedImportsOrExportsElements = 262576,
        JsxElementOrFragmentChildren = 131072,
        JsxElementAttributes = 131328,
        CaseOrDefaultClauseStatements = 81985,
        HeritageClauseTypes = 272,
        SourceFileStatements = 65537,
        Decorators = 24577,
        TypeArguments = 26896,
        TypeParameters = 26896,
        Parameters = 1296,
        IndexSignatureParameters = 4432
    }
}
declare function setTimeout(handler: (...args: any[]) => void, timeout: number): any;
declare function clearTimeout(handle: any): void;
declare namespace ts {
    enum FileWatcherEventKind {
        Created = 0,
        Changed = 1,
        Deleted = 2
    }
    type FileWatcherCallback = (fileName: string, eventKind: FileWatcherEventKind) => void;
    type DirectoryWatcherCallback = (fileName: string) => void;
    interface System {
        args: string[];
        newLine: string;
        useCaseSensitiveFileNames: boolean;
        write(s: string): void;
        writeOutputIsTTY?(): boolean;
        readFile(path: string, encoding?: string): string | undefined;
        getFileSize?(path: string): number;
        writeFile(path: string, data: string, writeByteOrderMark?: boolean): void;
        /**
         * @pollingInterval - this parameter is used in polling-based watchers and ignored in watchers that
         * use native OS file watching
         */
        watchFile?(path: string, callback: FileWatcherCallback, pollingInterval?: number): FileWatcher;
        watchDirectory?(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher;
        resolvePath(path: string): string;
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        createDirectory(path: string): void;
        getExecutingFilePath(): string;
        getCurrentDirectory(): string;
        getDirectories(path: string): string[];
        readDirectory(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
        getModifiedTime?(path: string): Date;
        setModifiedTime?(path: string, time: Date): void;
        deleteFile?(path: string): void;
        /**
         * A good implementation is node.js' `crypto.createHash`. (https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm)
         */
        createHash?(data: string): string;
        /** This must be cryptographically secure. Only implement this method using `crypto.createHash("sha256")`. */
        createSHA256Hash?(data: string): string;
        getMemoryUsage?(): number;
        exit(exitCode?: number): void;
        realpath?(path: string): string;
        setTimeout?(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
        clearTimeout?(timeoutId: any): void;
        clearScreen?(): void;
        base64decode?(input: string): string;
        base64encode?(input: string): string;
    }
    interface FileWatcher {
        close(): void;
    }
    function getNodeMajorVersion(): number | undefined;
    let sys: System;
}
declare namespace ts {
    type ErrorCallback = (message: DiagnosticMessage, length: number) => void;
    interface Scanner {
        getStartPos(): number;
        getToken(): SyntaxKind;
        getTextPos(): number;
        getTokenPos(): number;
        getTokenText(): string;
        getTokenValue(): string;
        hasExtendedUnicodeEscape(): boolean;
        hasPrecedingLineBreak(): boolean;
        isIdentifier(): boolean;
        isReservedWord(): boolean;
        isUnterminated(): boolean;
        reScanGreaterToken(): SyntaxKind;
        reScanSlashToken(): SyntaxKind;
        reScanTemplateToken(): SyntaxKind;
        scanJsxIdentifier(): SyntaxKind;
        scanJsxAttributeValue(): SyntaxKind;
        reScanJsxToken(): JsxTokenSyntaxKind;
        scanJsxToken(): JsxTokenSyntaxKind;
        scanJSDocToken(): JsDocSyntaxKind;
        scan(): SyntaxKind;
        getText(): string;
        setText(text: string | undefined, start?: number, length?: number): void;
        setOnError(onError: ErrorCallback | undefined): void;
        setScriptTarget(scriptTarget: ScriptTarget): void;
        setLanguageVariant(variant: LanguageVariant): void;
        setTextPos(textPos: number): void;
        lookAhead<T>(callback: () => T): T;
        scanRange<T>(start: number, length: number, callback: () => T): T;
        tryScan<T>(callback: () => T): T;
    }
    function tokenToString(t: SyntaxKind): string | undefined;
    function getPositionOfLineAndCharacter(sourceFile: SourceFileLike, line: number, character: number): number;
    function getLineAndCharacterOfPosition(sourceFile: SourceFileLike, position: number): LineAndCharacter;
    function isWhiteSpaceLike(ch: number): boolean;
    /** Does not include line breaks. For that, see isWhiteSpaceLike. */
    function isWhiteSpaceSingleLine(ch: number): boolean;
    function isLineBreak(ch: number): boolean;
    function couldStartTrivia(text: string, pos: number): boolean;
    function forEachLeadingCommentRange<U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean) => U): U | undefined;
    function forEachLeadingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean, state: T) => U, state: T): U | undefined;
    function forEachTrailingCommentRange<U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean) => U): U | undefined;
    function forEachTrailingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean, state: T) => U, state: T): U | undefined;
    function reduceEachLeadingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean, state: T, memo: U) => U, state: T, initial: U): U | undefined;
    function reduceEachTrailingCommentRange<T, U>(text: string, pos: number, cb: (pos: number, end: number, kind: CommentKind, hasTrailingNewLine: boolean, state: T, memo: U) => U, state: T, initial: U): U | undefined;
    function getLeadingCommentRanges(text: string, pos: number): CommentRange[] | undefined;
    function getTrailingCommentRanges(text: string, pos: number): CommentRange[] | undefined;
    /** Optionally, get the shebang */
    function getShebang(text: string): string | undefined;
    function isIdentifierStart(ch: number, languageVersion: ScriptTarget | undefined): boolean;
    function isIdentifierPart(ch: number, languageVersion: ScriptTarget | undefined): boolean;
    function createScanner(languageVersion: ScriptTarget, skipTrivia: boolean, languageVariant?: LanguageVariant, textInitial?: string, onError?: ErrorCallback, start?: number, length?: number): Scanner;
}
/** Non-internal stuff goes here */
declare namespace ts {
    function isExternalModuleNameRelative(moduleName: string): boolean;
    function sortAndDeduplicateDiagnostics<T extends Diagnostic>(diagnostics: ReadonlyArray<T>): T[];
<<<<<<< HEAD
=======
    function toPath(fileName: string, basePath: string | undefined, getCanonicalFileName: (path: string) => string): Path;
    function hasEntries(map: ReadonlyUnderscoreEscapedMap<any> | undefined): map is ReadonlyUnderscoreEscapedMap<any>;
}
declare namespace ts {
    const resolvingEmptyArray: never[];
    const emptyMap: ReadonlyMap<never>;
    const emptyUnderscoreEscapedMap: ReadonlyUnderscoreEscapedMap<never>;
    const externalHelpersModuleNameText = "tslib";
    function getDeclarationOfKind<T extends Declaration>(symbol: Symbol, kind: T["kind"]): T | undefined;
    /** Create a new escaped identifier map. */
    function createUnderscoreEscapedMap<T>(): UnderscoreEscapedMap<T>;
    function createSymbolTable(symbols?: ReadonlyArray<Symbol>): SymbolTable;
    function changesAffectModuleResolution(oldOptions: CompilerOptions, newOptions: CompilerOptions): boolean;
    /**
     * Iterates through the parent chain of a node and performs the callback on each parent until the callback
     * returns a truthy value, then returns that value.
     * If no such value is found, it applies the callback until the parent pointer is undefined or the callback returns "quit"
     * At that point findAncestor returns undefined.
     */
    function findAncestor<T extends Node>(node: Node | undefined, callback: (element: Node) => element is T): T | undefined;
    function findAncestor(node: Node | undefined, callback: (element: Node) => boolean | "quit"): Node | undefined;
    /**
     * Calls `callback` for each entry in the map, returning the first truthy result.
     * Use `map.forEach` instead for normal iteration.
     */
    function forEachEntry<T, U>(map: ReadonlyUnderscoreEscapedMap<T>, callback: (value: T, key: __String) => U | undefined): U | undefined;
    function forEachEntry<T, U>(map: ReadonlyMap<T>, callback: (value: T, key: string) => U | undefined): U | undefined;
    /** `forEachEntry` for just keys. */
    function forEachKey<T>(map: ReadonlyUnderscoreEscapedMap<{}>, callback: (key: __String) => T | undefined): T | undefined;
    function forEachKey<T>(map: ReadonlyMap<{}>, callback: (key: string) => T | undefined): T | undefined;
    /** Copy entries from `source` to `target`. */
    function copyEntries<T>(source: ReadonlyUnderscoreEscapedMap<T>, target: UnderscoreEscapedMap<T>): void;
    function copyEntries<T>(source: ReadonlyMap<T>, target: Map<T>): void;
    /**
     * Creates a set from the elements of an array.
     *
     * @param array the array of input elements.
     */
    function arrayToSet(array: ReadonlyArray<string>): Map<true>;
    function arrayToSet<T>(array: ReadonlyArray<T>, makeKey: (value: T) => string | undefined): Map<true>;
    function arrayToSet<T>(array: ReadonlyArray<T>, makeKey: (value: T) => __String | undefined): UnderscoreEscapedMap<true>;
    function cloneMap(map: SymbolTable): SymbolTable;
    function cloneMap<T>(map: ReadonlyMap<T>): Map<T>;
    function cloneMap<T>(map: ReadonlyUnderscoreEscapedMap<T>): UnderscoreEscapedMap<T>;
    function usingSingleLineStringWriter(action: (writer: EmitTextWriter) => void): string;
    function getFullWidth(node: Node): number;
    function getResolvedModule(sourceFile: SourceFile, moduleNameText: string): ResolvedModuleFull | undefined;
    function setResolvedModule(sourceFile: SourceFile, moduleNameText: string, resolvedModule: ResolvedModuleFull): void;
    function setResolvedTypeReferenceDirective(sourceFile: SourceFile, typeReferenceDirectiveName: string, resolvedTypeReferenceDirective: ResolvedTypeReferenceDirective): void;
    function moduleResolutionIsEqualTo(oldResolution: ResolvedModuleFull, newResolution: ResolvedModuleFull): boolean;
    function packageIdToString({ name, subModuleName, version }: PackageId): string;
    function typeDirectiveIsEqualTo(oldResolution: ResolvedTypeReferenceDirective, newResolution: ResolvedTypeReferenceDirective): boolean;
    function hasChangesInResolutions<T>(names: ReadonlyArray<string>, newResolutions: ReadonlyArray<T>, oldResolutions: ReadonlyMap<T> | undefined, comparer: (oldResolution: T, newResolution: T) => boolean): boolean;
    function containsParseError(node: Node): boolean;
    function getSourceFileOfNode(node: Node): SourceFile;
    function getSourceFileOfNode(node: Node | undefined): SourceFile | undefined;
    function isStatementWithLocals(node: Node): boolean;
    function getStartPositionOfLine(line: number, sourceFile: SourceFileLike): number;
    function nodePosToString(node: Node): string;
    function getEndLinePosition(line: number, sourceFile: SourceFileLike): number;
    /**
     * Returns a value indicating whether a name is unique globally or within the current file.
     * Note: This does not consider whether a name appears as a free identifier or not, so at the expression `x.y` this includes both `x` and `y`.
     */
    function isFileLevelUniqueName(sourceFile: SourceFile, name: string, hasGlobalName?: PrintHandlers["hasGlobalName"]): boolean;
    function nodeIsMissing(node: Node | undefined): boolean;
    function nodeIsPresent(node: Node | undefined): boolean;
    /**
     * Appends a range of value to begin of an array, returning the array.
     *
     * @param to The array to which `value` is to be appended. If `to` is `undefined`, a new array
     * is created if `value` was appended.
     * @param from The values to append to the array. If `from` is `undefined`, nothing is
     * appended. If an element of `from` is `undefined`, that element is not appended.
     */
    function prependStatements<T extends Statement>(to: T[], from: ReadonlyArray<T> | undefined): T[] | undefined;
    /**
     * Determine if the given comment is a triple-slash
     *
     * @return true if the comment is a triple-slash comment else false
     */
    function isRecognizedTripleSlashComment(text: string, commentPos: number, commentEnd: number): boolean;
    function isPinnedComment(text: string, start: number): boolean;
    function getTokenPosOfNode(node: Node, sourceFile?: SourceFileLike, includeJsDoc?: boolean): number;
    function getNonDecoratorTokenPosOfNode(node: Node, sourceFile?: SourceFileLike): number;
    function getSourceTextOfNodeFromSourceFile(sourceFile: SourceFile, node: Node, includeTrivia?: boolean): string;
    function getTextOfNodeFromSourceText(sourceText: string, node: Node, includeTrivia?: boolean): string;
    function getTextOfNode(node: Node, includeTrivia?: boolean): string;
    /**
     * Note: it is expected that the `nodeArray` and the `node` are within the same file.
     * For example, searching for a `SourceFile` in a `SourceFile[]` wouldn't work.
     */
    function indexOfNode(nodeArray: ReadonlyArray<Node>, node: Node): number;
    /**
     * Gets flags that control emit behavior of a node.
     */
    function getEmitFlags(node: Node): EmitFlags;
    function getLiteralText(node: LiteralLikeNode, sourceFile: SourceFile): string;
    function getTextOfConstantValue(value: string | number): string;
    function escapeLeadingUnderscores(identifier: string): __String;
    /**
     * @deprecated Use `id.escapedText` to get the escaped text of an Identifier.
     * @param identifier The identifier to escape
     */
    function escapeIdentifier(identifier: string): string;
    function makeIdentifierFromModuleName(moduleName: string): string;
    function isBlockOrCatchScoped(declaration: Declaration): boolean;
    function isCatchClauseVariableDeclarationOrBindingElement(declaration: Declaration): boolean;
    function isAmbientModule(node: Node): node is AmbientModuleDeclaration;
    function isModuleWithStringLiteralName(node: Node): node is ModuleDeclaration;
    function isNonGlobalAmbientModule(node: Node): node is ModuleDeclaration & {
        name: StringLiteral;
    };
    /**
     * An effective module (namespace) declaration is either
     * 1. An actual declaration: namespace X { ... }
     * 2. A Javascript declaration, which is:
     *    An identifier in a nested property access expression: Y in `X.Y.Z = { ... }`
     */
    function isEffectiveModuleDeclaration(node: Node): boolean;
    /** Given a symbol for a module, checks that it is a shorthand ambient module. */
    function isShorthandAmbientModuleSymbol(moduleSymbol: Symbol): boolean;
    function isBlockScopedContainerTopLevel(node: Node): boolean;
    function isGlobalScopeAugmentation(module: ModuleDeclaration): boolean;
    function isExternalModuleAugmentation(node: Node): node is AmbientModuleDeclaration;
    function isModuleAugmentationExternal(node: AmbientModuleDeclaration): boolean;
    function isEffectiveExternalModule(node: SourceFile, compilerOptions: CompilerOptions): boolean;
    function isBlockScope(node: Node, parentNode: Node): boolean;
    function isDeclarationWithTypeParameters(node: Node): node is DeclarationWithTypeParameters;
    function isAnyImportSyntax(node: Node): node is AnyImportSyntax;
    function isLateVisibilityPaintedStatement(node: Node): node is LateVisibilityPaintedStatement;
    function isAnyImportOrReExport(node: Node): node is AnyImportOrReExport;
    function getEnclosingBlockScopeContainer(node: Node): Node;
    function declarationNameToString(name: DeclarationName | QualifiedName): string;
    function getNameFromIndexInfo(info: IndexInfo): string | undefined;
    function getTextOfPropertyName(name: PropertyName): __String;
    function entityNameToString(name: EntityNameOrEntityNameExpression): string;
    function createDiagnosticForNode(node: Node, message: DiagnosticMessage, arg0?: string | number, arg1?: string | number, arg2?: string | number, arg3?: string | number): DiagnosticWithLocation;
    function createDiagnosticForNodeArray(sourceFile: SourceFile, nodes: NodeArray<Node>, message: DiagnosticMessage, arg0?: string | number, arg1?: string | number, arg2?: string | number, arg3?: string | number): Diagnostic;
    function createDiagnosticForNodeInSourceFile(sourceFile: SourceFile, node: Node, message: DiagnosticMessage, arg0?: string | number, arg1?: string | number, arg2?: string | number, arg3?: string | number): DiagnosticWithLocation;
    function createDiagnosticForNodeFromMessageChain(node: Node, messageChain: DiagnosticMessageChain): DiagnosticWithLocation;
    function getSpanOfTokenAtPosition(sourceFile: SourceFile, pos: number): TextSpan;
    function getErrorSpanForNode(sourceFile: SourceFile, node: Node): TextSpan;
    function isExternalOrCommonJsModule(file: SourceFile): boolean;
    function isJsonSourceFile(file: SourceFile): file is JsonSourceFile;
    function isConstEnumDeclaration(node: Node): boolean;
    function isConst(node: Node): boolean;
    function isLet(node: Node): boolean;
    function isSuperCall(n: Node): n is SuperCall;
    function isImportCall(n: Node): n is ImportCall;
    function isLiteralImportTypeNode(n: Node): n is LiteralImportTypeNode;
    function isPrologueDirective(node: Node): node is PrologueDirective;
    function getLeadingCommentRangesOfNode(node: Node, sourceFileOfNode: SourceFile): CommentRange[] | undefined;
    function getJSDocCommentRanges(node: Node, text: string): CommentRange[] | undefined;
    const fullTripleSlashReferencePathRegEx: RegExp;
    const fullTripleSlashAMDReferencePathRegEx: RegExp;
    function isPartOfTypeNode(node: Node): boolean;
    function isChildOfNodeWithKind(node: Node, kind: SyntaxKind): boolean;
    function forEachReturnStatement<T>(body: Block, visitor: (stmt: ReturnStatement) => T): T | undefined;
    function forEachYieldExpression(body: Block, visitor: (expr: YieldExpression) => void): void;
    /**
     * Gets the most likely element type for a TypeNode. This is not an exhaustive test
     * as it assumes a rest argument can only be an array type (either T[], or Array<T>).
     *
     * @param node The type node.
     */
    function getRestParameterElementType(node: TypeNode | undefined): TypeNode | undefined;
    function getMembersOfDeclaration(node: Declaration): NodeArray<ClassElement | TypeElement | ObjectLiteralElement> | undefined;
    function isVariableLike(node: Node): node is VariableLikeDeclaration;
    function isVariableLikeOrAccessor(node: Node): node is AccessorDeclaration | VariableLikeDeclaration;
    function isVariableDeclarationInVariableStatement(node: VariableDeclaration): boolean;
    function isValidESSymbolDeclaration(node: Node): node is VariableDeclaration | PropertyDeclaration | SignatureDeclaration;
    function introducesArgumentsExoticObject(node: Node): boolean;
    function unwrapInnermostStatementOfLabel(node: LabeledStatement, beforeUnwrapLabelCallback?: (node: LabeledStatement) => void): Statement;
    function isFunctionBlock(node: Node): boolean;
    function isObjectLiteralMethod(node: Node): node is MethodDeclaration;
    function isObjectLiteralOrClassExpressionMethod(node: Node): node is MethodDeclaration;
    function isIdentifierTypePredicate(predicate: TypePredicate): predicate is IdentifierTypePredicate;
    function isThisTypePredicate(predicate: TypePredicate): predicate is ThisTypePredicate;
    function getPropertyAssignment(objectLiteral: ObjectLiteralExpression, key: string, key2?: string): ReadonlyArray<PropertyAssignment>;
    function getTsConfigObjectLiteralExpression(tsConfigSourceFile: TsConfigSourceFile | undefined): ObjectLiteralExpression | undefined;
    function getTsConfigPropArrayElementValue(tsConfigSourceFile: TsConfigSourceFile | undefined, propKey: string, elementValue: string): StringLiteral | undefined;
    function getTsConfigPropArray(tsConfigSourceFile: TsConfigSourceFile | undefined, propKey: string): ReadonlyArray<PropertyAssignment>;
    function getContainingFunction(node: Node): SignatureDeclaration | undefined;
    function getContainingClass(node: Node): ClassLikeDeclaration | undefined;
    function getThisContainer(node: Node, includeArrowFunctions: boolean): Node;
    function getNewTargetContainer(node: Node): Node | undefined;
    /**
     * Given an super call/property node, returns the closest node where
     * - a super call/property access is legal in the node and not legal in the parent node the node.
     *   i.e. super call is legal in constructor but not legal in the class body.
     * - the container is an arrow function (so caller might need to call getSuperContainer again in case it needs to climb higher)
     * - a super call/property is definitely illegal in the container (but might be legal in some subnode)
     *   i.e. super property access is illegal in function declaration but can be legal in the statement list
     */
    function getSuperContainer(node: Node, stopOnFunctions: boolean): Node;
    function getImmediatelyInvokedFunctionExpression(func: Node): CallExpression | undefined;
    /**
     * Determines whether a node is a property or element access expression for `super`.
     */
    function isSuperProperty(node: Node): node is SuperProperty;
    /**
     * Determines whether a node is a property or element access expression for `this`.
     */
    function isThisProperty(node: Node): boolean;
    function getEntityNameFromTypeNode(node: TypeNode): EntityNameOrEntityNameExpression | undefined;
    function getInvokedExpression(node: CallLikeExpression): Expression;
    function nodeCanBeDecorated(node: ClassDeclaration): true;
    function nodeCanBeDecorated(node: ClassElement, parent: Node): boolean;
    function nodeCanBeDecorated(node: Node, parent: Node, grandparent: Node): boolean;
    function nodeIsDecorated(node: ClassDeclaration): boolean;
    function nodeIsDecorated(node: ClassElement, parent: Node): boolean;
    function nodeIsDecorated(node: Node, parent: Node, grandparent: Node): boolean;
    function nodeOrChildIsDecorated(node: ClassDeclaration): boolean;
    function nodeOrChildIsDecorated(node: ClassElement, parent: Node): boolean;
    function nodeOrChildIsDecorated(node: Node, parent: Node, grandparent: Node): boolean;
    function childIsDecorated(node: ClassDeclaration): boolean;
    function childIsDecorated(node: Node, parent: Node): boolean;
    function isJSXTagName(node: Node): boolean;
    function isExpressionNode(node: Node): boolean;
    function isInExpressionContext(node: Node): boolean;
    function isExternalModuleImportEqualsDeclaration(node: Node): boolean;
    function getExternalModuleImportEqualsDeclarationExpression(node: Node): Expression;
    function isInternalModuleImportEqualsDeclaration(node: Node): node is ImportEqualsDeclaration;
    function isSourceFileJavaScript(file: SourceFile): boolean;
    function isSourceFileNotJavaScript(file: SourceFile): boolean;
    function isInJavaScriptFile(node: Node | undefined): boolean;
    function isInJsonFile(node: Node | undefined): boolean;
    function isInJSDoc(node: Node | undefined): boolean;
    function isJSDocIndexSignature(node: TypeReferenceNode | ExpressionWithTypeArguments): boolean | undefined;
    /**
     * Returns true if the node is a CallExpression to the identifier 'require' with
     * exactly one argument (of the form 'require("name")').
     * This function does not test if the node is in a JavaScript file or not.
     */
    function isRequireCall(callExpression: Node, checkArgumentIsStringLiteralLike: true): callExpression is RequireOrImportCall & {
        expression: Identifier;
        arguments: [StringLiteralLike];
    };
    function isRequireCall(callExpression: Node, checkArgumentIsStringLiteralLike: boolean): callExpression is CallExpression;
    function isSingleOrDoubleQuote(charCode: number): boolean;
    function isStringDoubleQuoted(str: StringLiteralLike, sourceFile: SourceFile): boolean;
    function getDeclarationOfJSInitializer(node: Node): Node | undefined;
    /** Get the initializer, taking into account defaulted Javascript initializers */
    function getEffectiveInitializer(node: HasExpressionInitializer): Expression | undefined;
    /** Get the declaration initializer when it is container-like (See getJavascriptInitializer). */
    function getDeclaredJavascriptInitializer(node: HasExpressionInitializer): Expression | undefined;
    /**
     * Get the assignment 'initializer' -- the righthand side-- when the initializer is container-like (See getJavascriptInitializer).
     * We treat the right hand side of assignments with container-like initalizers as declarations.
     */
    function getAssignedJavascriptInitializer(node: Node): Expression | undefined;
    /**
     * Recognized Javascript container-like initializers are:
     * 1. (function() {})() -- IIFEs
     * 2. function() { } -- Function expressions
     * 3. class { } -- Class expressions
     * 4. {} -- Empty object literals
     * 5. { ... } -- Non-empty object literals, when used to initialize a prototype, like `C.prototype = { m() { } }`
     *
     * This function returns the provided initializer, or undefined if it is not valid.
     */
    function getJavascriptInitializer(initializer: Node, isPrototypeAssignment: boolean): Expression | undefined;
    function isDefaultedJavascriptInitializer(node: BinaryExpression): boolean | undefined;
    /** Given a Javascript initializer, return the outer name. That is, the lhs of the assignment or the declaration name. */
    function getOuterNameOfJsInitializer(node: Declaration): DeclarationName | undefined;
    function getRightMostAssignedExpression(node: Expression): Expression;
    function isExportsIdentifier(node: Node): boolean;
    function isModuleExportsPropertyAccessExpression(node: Node): boolean;
    function getSpecialPropertyAssignmentKind(expr: BinaryExpression): SpecialPropertyAssignmentKind;
    function getInitializerOfBinaryExpression(expr: BinaryExpression): Expression;
    function isPrototypePropertyAssignment(node: Node): boolean;
    function isSpecialPropertyDeclaration(expr: PropertyAccessExpression): boolean;
    function importFromModuleSpecifier(node: StringLiteralLike): AnyValidImportOrReExport;
    function tryGetImportFromModuleSpecifier(node: StringLiteralLike): AnyValidImportOrReExport | undefined;
    function getExternalModuleName(node: AnyImportOrReExport | ImportTypeNode): Expression | undefined;
    function getNamespaceDeclarationNode(node: ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration): ImportEqualsDeclaration | NamespaceImport | undefined;
    function isDefaultImport(node: ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration): boolean;
    function hasQuestionToken(node: Node): boolean;
    function isJSDocConstructSignature(node: Node): boolean;
    function isJSDocTypeAlias(node: Node): node is JSDocTypedefTag | JSDocCallbackTag;
    function isTypeAlias(node: Node): node is JSDocTypedefTag | JSDocCallbackTag | TypeAliasDeclaration;
    function getJSDocCommentsAndTags(hostNode: Node): ReadonlyArray<JSDoc | JSDocTag>;
    /** Does the opposite of `getJSDocParameterTags`: given a JSDoc parameter, finds the parameter corresponding to it. */
    function getParameterSymbolFromJSDoc(node: JSDocParameterTag): Symbol | undefined;
    function getHostSignatureFromJSDoc(node: Node): SignatureDeclaration | undefined;
    function getHostSignatureFromJSDocHost(host: HasJSDoc): SignatureDeclaration | undefined;
    function getJSDocHost(node: Node): HasJSDoc;
    function getTypeParameterFromJsDoc(node: TypeParameterDeclaration & {
        parent: JSDocTemplateTag;
    }): TypeParameterDeclaration | undefined;
    function hasRestParameter(s: SignatureDeclaration | JSDocSignature): boolean;
    function isRestParameter(node: ParameterDeclaration | JSDocParameterTag): boolean;
    enum AssignmentKind {
        None = 0,
        Definite = 1,
        Compound = 2
    }
    function getAssignmentTargetKind(node: Node): AssignmentKind;
    function isAssignmentTarget(node: Node): boolean;
    type NodeWithPossibleHoistedDeclaration = Block | VariableStatement | WithStatement | IfStatement | SwitchStatement | CaseBlock | CaseClause | DefaultClause | LabeledStatement | ForStatement | ForInStatement | ForOfStatement | DoStatement | WhileStatement | TryStatement | CatchClause;
    /**
     * Indicates whether a node could contain a `var` VariableDeclarationList that contributes to
     * the same `var` declaration scope as the node's parent.
     */
    function isNodeWithPossibleHoistedDeclaration(node: Node): node is NodeWithPossibleHoistedDeclaration;
    type ValueSignatureDeclaration = FunctionDeclaration | MethodDeclaration | ConstructorDeclaration | AccessorDeclaration | FunctionExpression | ArrowFunction;
    function isValueSignatureDeclaration(node: Node): node is ValueSignatureDeclaration;
    function walkUpParenthesizedTypes(node: Node): Node;
    function walkUpParenthesizedExpressions(node: Node): Node;
    function skipParentheses(node: Expression): Expression;
    function skipParentheses(node: Node): Node;
    function isDeleteTarget(node: Node): boolean;
    function isNodeDescendantOf(node: Node, ancestor: Node): boolean;
    function isDeclarationName(name: Node): boolean;
    function isAnyDeclarationName(name: Node): boolean;
    function isLiteralComputedPropertyDeclarationName(node: Node): boolean;
    function isIdentifierName(node: Identifier): boolean;
    function isAliasSymbolDeclaration(node: Node): boolean;
    function exportAssignmentIsAlias(node: ExportAssignment | BinaryExpression): boolean;
    function getClassExtendsHeritageClauseElement(node: ClassLikeDeclaration | InterfaceDeclaration): ExpressionWithTypeArguments | undefined;
    function getClassImplementsHeritageClauseElements(node: ClassLikeDeclaration): NodeArray<ExpressionWithTypeArguments> | undefined;
    /** Returns the node in an `extends` or `implements` clause of a class or interface. */
    function getAllSuperTypeNodes(node: Node): ReadonlyArray<TypeNode>;
    function getInterfaceBaseTypeNodes(node: InterfaceDeclaration): NodeArray<ExpressionWithTypeArguments> | undefined;
    function getHeritageClause(clauses: NodeArray<HeritageClause> | undefined, kind: SyntaxKind): HeritageClause | undefined;
    function tryResolveScriptReference(host: ScriptReferenceHost, sourceFile: SourceFile, reference: FileReference): SourceFile | undefined;
    function getAncestor(node: Node | undefined, kind: SyntaxKind): Node | undefined;
    function isKeyword(token: SyntaxKind): boolean;
    function isContextualKeyword(token: SyntaxKind): boolean;
    function isNonContextualKeyword(token: SyntaxKind): boolean;
    function isStringANonContextualKeyword(name: string): boolean;
    type TriviaKind = SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia | SyntaxKind.NewLineTrivia | SyntaxKind.WhitespaceTrivia | SyntaxKind.ShebangTrivia | SyntaxKind.ConflictMarkerTrivia;
    function isTrivia(token: SyntaxKind): token is TriviaKind;
    enum FunctionFlags {
        Normal = 0,
        Generator = 1,
        Async = 2,
        Invalid = 4,
        AsyncGenerator = 3
    }
    function getFunctionFlags(node: SignatureDeclaration | undefined): FunctionFlags;
    function isAsyncFunction(node: Node): boolean;
    function isStringOrNumericLiteral(node: Node): node is StringLiteral | NumericLiteral;
    /**
     * A declaration has a dynamic name if both of the following are true:
     *   1. The declaration has a computed property name
     *   2. The computed name is *not* expressed as Symbol.<name>, where name
     *      is a property of the Symbol constructor that denotes a built in
     *      Symbol.
     */
    function hasDynamicName(declaration: Declaration): declaration is DynamicNamedDeclaration;
    function isDynamicName(name: DeclarationName): boolean;
    /**
     * Checks if the expression is of the form:
     *    Symbol.name
     * where Symbol is literally the word "Symbol", and name is any identifierName
     */
    function isWellKnownSymbolSyntactically(node: Expression): boolean;
    function getPropertyNameForPropertyNameNode(name: DeclarationName): __String | undefined;
    type PropertyNameLiteral = Identifier | StringLiteralLike | NumericLiteral;
    function isPropertyNameLiteral(node: Node): node is PropertyNameLiteral;
    function getTextOfIdentifierOrLiteral(node: PropertyNameLiteral): string;
    function getEscapedTextOfIdentifierOrLiteral(node: PropertyNameLiteral): __String;
    function getPropertyNameForKnownSymbolName(symbolName: string): __String;
    function isKnownSymbol(symbol: Symbol): boolean;
    /**
     * Includes the word "Symbol" with unicode escapes
     */
    function isESSymbolIdentifier(node: Node): boolean;
    function isPushOrUnshiftIdentifier(node: Identifier): boolean;
    function isParameterDeclaration(node: VariableLikeDeclaration): boolean;
    function getRootDeclaration(node: Node): Node;
    function nodeStartsNewLexicalEnvironment(node: Node): boolean;
    function nodeIsSynthesized(range: TextRange): boolean;
    function getOriginalSourceFile(sourceFile: SourceFile): SourceFile;
    enum Associativity {
        Left = 0,
        Right = 1
    }
    function getExpressionAssociativity(expression: Expression): Associativity;
    function getOperatorAssociativity(kind: SyntaxKind, operator: SyntaxKind, hasArguments?: boolean): Associativity;
    function getExpressionPrecedence(expression: Expression): number;
    function getOperator(expression: Expression): SyntaxKind;
    function getOperatorPrecedence(nodeKind: SyntaxKind, operatorKind: SyntaxKind, hasArguments?: boolean): number;
    function getBinaryOperatorPrecedence(kind: SyntaxKind): number;
    function createDiagnosticCollection(): DiagnosticCollection;
    /**
     * Based heavily on the abstract 'Quote'/'QuoteJSONString' operation from ECMA-262 (24.3.2.2),
     * but augmented for a few select characters (e.g. lineSeparator, paragraphSeparator, nextLine)
     * Note that this doesn't actually wrap the input in double quotes.
     */
    function escapeString(s: string, quoteChar?: CharacterCodes.doubleQuote | CharacterCodes.singleQuote | CharacterCodes.backtick): string;
    function isIntrinsicJsxName(name: __String | string): boolean;
    function escapeNonAsciiString(s: string, quoteChar?: CharacterCodes.doubleQuote | CharacterCodes.singleQuote | CharacterCodes.backtick): string;
    function getIndentString(level: number): string;
    function getIndentSize(): number;
    function createTextWriter(newLine: string): EmitTextWriter;
    function getResolvedExternalModuleName(host: EmitHost, file: SourceFile, referenceFile?: SourceFile): string;
    function getExternalModuleNameFromDeclaration(host: EmitHost, resolver: EmitResolver, declaration: ImportEqualsDeclaration | ImportDeclaration | ExportDeclaration | ModuleDeclaration | ImportTypeNode): string | undefined;
    /**
     * Resolves a local path to a path which is absolute to the base of the emit
     */
    function getExternalModuleNameFromPath(host: EmitHost, fileName: string, referencePath?: string): string;
    function getOwnEmitOutputFilePath(sourceFile: SourceFile, host: EmitHost, extension: string): string;
    function getDeclarationEmitOutputFilePath(sourceFile: SourceFile, host: EmitHost): string;
    interface EmitFileNames {
        jsFilePath: string;
        sourceMapFilePath: string | undefined;
        declarationFilePath: string | undefined;
        declarationMapPath: string | undefined;
        bundleInfoPath: string | undefined;
    }
    /**
     * Gets the source files that are expected to have an emit output.
     *
     * Originally part of `forEachExpectedEmitFile`, this functionality was extracted to support
     * transformations.
     *
     * @param host An EmitHost.
     * @param targetSourceFile An optional target source file to emit.
     */
    function getSourceFilesToEmit(host: EmitHost, targetSourceFile?: SourceFile): ReadonlyArray<SourceFile>;
    /** Don't call this for `--outFile`, just for `--outDir` or plain emit. `--outFile` needs additional checks. */
    function sourceFileMayBeEmitted(sourceFile: SourceFile, options: CompilerOptions, isSourceFileFromExternalLibrary: (file: SourceFile) => boolean): boolean;
    function getSourceFilePathInNewDir(sourceFile: SourceFile, host: EmitHost, newDirPath: string): string;
    function writeFile(host: EmitHost, diagnostics: DiagnosticCollection, fileName: string, data: string, writeByteOrderMark: boolean, sourceFiles?: ReadonlyArray<SourceFile>): void;
    function getLineOfLocalPosition(currentSourceFile: SourceFile, pos: number): number;
    function getLineOfLocalPositionFromLineMap(lineMap: ReadonlyArray<number>, pos: number): number;
    function getFirstConstructorWithBody(node: ClassLikeDeclaration): ConstructorDeclaration | undefined;
    /** Get the type annotation for the value parameter. */
    function getSetAccessorTypeAnnotationNode(accessor: SetAccessorDeclaration): TypeNode | undefined;
    function getThisParameter(signature: SignatureDeclaration | JSDocSignature): ParameterDeclaration | undefined;
    function parameterIsThisKeyword(parameter: ParameterDeclaration): boolean;
    function isThisIdentifier(node: Node | undefined): boolean;
    function identifierIsThisKeyword(id: Identifier): boolean;
    function getAllAccessorDeclarations(declarations: NodeArray<Declaration>, accessor: AccessorDeclaration): AllAccessorDeclarations;
    /**
     * Gets the effective type annotation of a variable, parameter, or property. If the node was
     * parsed in a JavaScript file, gets the type annotation from JSDoc.
     */
    function getEffectiveTypeAnnotationNode(node: Node): TypeNode | undefined;
    function getTypeAnnotationNode(node: Node): TypeNode | undefined;
    /**
     * Gets the effective return type annotation of a signature. If the node was parsed in a
     * JavaScript file, gets the return type annotation from JSDoc.
     */
    function getEffectiveReturnTypeNode(node: SignatureDeclaration | JSDocSignature): TypeNode | undefined;
    /**
     * Gets the effective type parameters. If the node was parsed in a
     * JavaScript file, gets the type parameters from the `@template` tag from JSDoc.
     */
    function getEffectiveTypeParameterDeclarations(node: DeclarationWithTypeParameters): ReadonlyArray<TypeParameterDeclaration>;
    function getJSDocTypeParameterDeclarations(node: DeclarationWithTypeParameters): ReadonlyArray<TypeParameterDeclaration>;
    /**
     * Gets the effective type annotation of the value parameter of a set accessor. If the node
     * was parsed in a JavaScript file, gets the type annotation from JSDoc.
     */
    function getEffectiveSetAccessorTypeAnnotationNode(node: SetAccessorDeclaration): TypeNode | undefined;
    function emitNewLineBeforeLeadingComments(lineMap: ReadonlyArray<number>, writer: EmitTextWriter, node: TextRange, leadingComments: ReadonlyArray<CommentRange> | undefined): void;
    function emitNewLineBeforeLeadingCommentsOfPosition(lineMap: ReadonlyArray<number>, writer: EmitTextWriter, pos: number, leadingComments: ReadonlyArray<CommentRange> | undefined): void;
    function emitNewLineBeforeLeadingCommentOfPosition(lineMap: ReadonlyArray<number>, writer: EmitTextWriter, pos: number, commentPos: number): void;
    function emitComments(text: string, lineMap: ReadonlyArray<number>, writer: EmitTextWriter, comments: ReadonlyArray<CommentRange> | undefined, leadingSeparator: boolean, trailingSeparator: boolean, newLine: string, writeComment: (text: string, lineMap: ReadonlyArray<number>, writer: EmitTextWriter, commentPos: number, commentEnd: number, newLine: string) => void): void;
    /**
     * Detached comment is a comment at the top of file or function body that is separated from
     * the next statement by space.
     */
    function emitDetachedComments(text: string, lineMap: ReadonlyArray<number>, writer: EmitTextWriter, writeComment: (text: string, lineMap: ReadonlyArray<number>, writer: EmitTextWriter, commentPos: number, commentEnd: number, newLine: string) => void, node: TextRange, newLine: string, removeComments: boolean): {
        nodePos: number;
        detachedCommentEndPos: number;
    } | undefined;
    function writeCommentRange(text: string, lineMap: ReadonlyArray<number>, writer: EmitTextWriter, commentPos: number, commentEnd: number, newLine: string): void;
    function hasModifiers(node: Node): boolean;
    function hasModifier(node: Node, flags: ModifierFlags): boolean;
    function hasStaticModifier(node: Node): boolean;
    function hasReadonlyModifier(node: Node): boolean;
    function getSelectedModifierFlags(node: Node, flags: ModifierFlags): ModifierFlags;
    function getModifierFlags(node: Node): ModifierFlags;
    function getModifierFlagsNoCache(node: Node): ModifierFlags;
    function modifierToFlag(token: SyntaxKind): ModifierFlags;
    function isLogicalOperator(token: SyntaxKind): boolean;
    function isAssignmentOperator(token: SyntaxKind): boolean;
    /** Get `C` given `N` if `N` is in the position `class C extends N` where `N` is an ExpressionWithTypeArguments. */
    function tryGetClassExtendingExpressionWithTypeArguments(node: Node): ClassLikeDeclaration | undefined;
    function isAssignmentExpression(node: Node, excludeCompoundAssignment: true): node is AssignmentExpression<EqualsToken>;
    function isAssignmentExpression(node: Node, excludeCompoundAssignment?: false): node is AssignmentExpression<AssignmentOperatorToken>;
    function isDestructuringAssignment(node: Node): node is DestructuringAssignment;
    function isExpressionWithTypeArgumentsInClassExtendsClause(node: Node): boolean;
    function isExpressionWithTypeArgumentsInClassImplementsClause(node: Node): node is ExpressionWithTypeArguments;
    function isEntityNameExpression(node: Node): node is EntityNameExpression;
    function isPropertyAccessEntityNameExpression(node: Node): node is PropertyAccessEntityNameExpression;
    function isPrototypeAccess(node: Node): node is PropertyAccessExpression;
    function isRightSideOfQualifiedNameOrPropertyAccess(node: Node): boolean;
    function isEmptyObjectLiteral(expression: Node): boolean;
    function isEmptyArrayLiteral(expression: Node): boolean;
    function getLocalSymbolForExportDefault(symbol: Symbol): Symbol | undefined;
    /** Return ".ts", ".d.ts", or ".tsx", if that is the extension. */
    function tryExtractTypeScriptExtension(fileName: string): string | undefined;
    /**
     * Converts a string to a base-64 encoded ASCII string.
     */
    function convertToBase64(input: string): string;
    function base64encode(host: {
        base64encode?(input: string): string;
    } | undefined, input: string): string;
    function base64decode(host: {
        base64decode?(input: string): string;
    } | undefined, input: string): string;
    function getNewLineCharacter(options: CompilerOptions | PrinterOptions, getNewLine?: () => string): string;
    function formatSyntaxKind(kind: SyntaxKind | undefined): string;
    function formatModifierFlags(flags: ModifierFlags | undefined): string;
    function formatTransformFlags(flags: TransformFlags | undefined): string;
    function formatEmitFlags(flags: EmitFlags | undefined): string;
    function formatSymbolFlags(flags: SymbolFlags | undefined): string;
    function formatTypeFlags(flags: TypeFlags | undefined): string;
    function formatObjectFlags(flags: ObjectFlags | undefined): string;
    /**
     * Creates a new TextRange from the provided pos and end.
     *
     * @param pos The start position.
     * @param end The end position.
     */
    function createRange(pos: number, end: number): TextRange;
    /**
     * Creates a new TextRange from a provided range with a new end position.
     *
     * @param range A TextRange.
     * @param end The new end position.
     */
    function moveRangeEnd(range: TextRange, end: number): TextRange;
    /**
     * Creates a new TextRange from a provided range with a new start position.
     *
     * @param range A TextRange.
     * @param pos The new Start position.
     */
    function moveRangePos(range: TextRange, pos: number): TextRange;
    /**
     * Moves the start position of a range past any decorators.
     */
    function moveRangePastDecorators(node: Node): TextRange;
    /**
     * Moves the start position of a range past any decorators or modifiers.
     */
    function moveRangePastModifiers(node: Node): TextRange;
    /**
     * Determines whether a TextRange has the same start and end positions.
     *
     * @param range A TextRange.
     */
    function isCollapsedRange(range: TextRange): boolean;
    /**
     * Creates a new TextRange for a token at the provides start position.
     *
     * @param pos The start position.
     * @param token The token.
     */
    function createTokenRange(pos: number, token: SyntaxKind): TextRange;
    function rangeIsOnSingleLine(range: TextRange, sourceFile: SourceFile): boolean;
    function rangeStartPositionsAreOnSameLine(range1: TextRange, range2: TextRange, sourceFile: SourceFile): boolean;
    function rangeEndPositionsAreOnSameLine(range1: TextRange, range2: TextRange, sourceFile: SourceFile): boolean;
    function rangeStartIsOnSameLineAsRangeEnd(range1: TextRange, range2: TextRange, sourceFile: SourceFile): boolean;
    function rangeEndIsOnSameLineAsRangeStart(range1: TextRange, range2: TextRange, sourceFile: SourceFile): boolean;
    function positionsAreOnSameLine(pos1: number, pos2: number, sourceFile: SourceFile): boolean;
    function getStartPositionOfRange(range: TextRange, sourceFile: SourceFile): number;
    /**
     * Determines whether a name was originally the declaration name of an enum or namespace
     * declaration.
     */
    function isDeclarationNameOfEnumOrNamespace(node: Identifier): boolean;
    function getInitializedVariables(node: VariableDeclarationList): ReadonlyArray<VariableDeclaration>;
    function isWatchSet(options: CompilerOptions): boolean | undefined;
    function getCheckFlags(symbol: Symbol): CheckFlags;
    function getDeclarationModifierFlagsFromSymbol(s: Symbol): ModifierFlags;
    function skipAlias(symbol: Symbol, checker: TypeChecker): Symbol;
    /** See comment on `declareModuleMember` in `binder.ts`. */
    function getCombinedLocalAndExportSymbolFlags(symbol: Symbol): SymbolFlags;
    function isWriteOnlyAccess(node: Node): boolean;
    function isWriteAccess(node: Node): boolean;
    function compareDataObjects(dst: any, src: any): boolean;
    /**
     * clears already present map by calling onDeleteExistingValue callback before deleting that key/value
     */
    function clearMap<T>(map: Map<T>, onDeleteValue: (valueInMap: T, key: string) => void): void;
    interface MutateMapOptions<T, U> {
        createNewValue(key: string, valueInNewMap: U): T;
        onDeleteValue(existingValue: T, key: string): void;
        /**
         * If present this is called with the key when there is value for that key both in new map as well as existing map provided
         * Caller can then decide to update or remove this key.
         * If the key is removed, caller will get callback of createNewValue for that key.
         * If this callback is not provided, the value of such keys is not updated.
         */
        onExistingValue?(existingValue: T, valueInNewMap: U, key: string): void;
    }
    /**
     * Mutates the map with newMap such that keys in map will be same as newMap.
     */
    function mutateMap<T, U>(map: Map<T>, newMap: ReadonlyMap<U>, options: MutateMapOptions<T, U>): void;
    /** Calls `callback` on `directory` and every ancestor directory it has, returning the first defined result. */
    function forEachAncestorDirectory<T>(directory: string, callback: (directory: string) => T | undefined): T | undefined;
    function isAbstractConstructorType(type: Type): boolean;
    function isAbstractConstructorSymbol(symbol: Symbol): boolean;
    function getClassLikeDeclarationOfSymbol(symbol: Symbol): ClassLikeDeclaration | undefined;
    function getObjectFlags(type: Type): ObjectFlags;
    function typeHasCallOrConstructSignatures(type: Type, checker: TypeChecker): boolean;
    function forSomeAncestorDirectory(directory: string, callback: (directory: string) => boolean): boolean;
    function isUMDExportSymbol(symbol: Symbol | undefined): boolean | undefined;
    function showModuleSpecifier({ moduleSpecifier }: ImportDeclaration): string;
    function getLastChild(node: Node): Node | undefined;
    /** Add a value to a set, and return true if it wasn't already present. */
    function addToSeen(seen: Map<true>, key: string | number): boolean;
    function addToSeen<T>(seen: Map<T>, key: string | number, value: T): boolean;
    function isObjectTypeDeclaration(node: Node): node is ObjectTypeDeclaration;
>>>>>>> a56b272d3891916a8debe36087fe7563bbade164
}
declare namespace ts {
    function getDefaultLibFileName(options: CompilerOptions): string;
    function textSpanEnd(span: TextSpan): number;
    function textSpanIsEmpty(span: TextSpan): boolean;
    function textSpanContainsPosition(span: TextSpan, position: number): boolean;
    function textSpanContainsTextSpan(span: TextSpan, other: TextSpan): boolean;
    function textSpanOverlapsWith(span: TextSpan, other: TextSpan): boolean;
    function textSpanOverlap(span1: TextSpan, span2: TextSpan): TextSpan | undefined;
    function textSpanIntersectsWithTextSpan(span: TextSpan, other: TextSpan): boolean;
    function textSpanIntersectsWith(span: TextSpan, start: number, length: number): boolean;
    function decodedTextSpanIntersectsWith(start1: number, length1: number, start2: number, length2: number): boolean;
    function textSpanIntersectsWithPosition(span: TextSpan, position: number): boolean;
    function textSpanIntersection(span1: TextSpan, span2: TextSpan): TextSpan | undefined;
    function createTextSpan(start: number, length: number): TextSpan;
    function createTextSpanFromBounds(start: number, end: number): TextSpan;
    function textChangeRangeNewSpan(range: TextChangeRange): TextSpan;
    function textChangeRangeIsUnchanged(range: TextChangeRange): boolean;
    function createTextChangeRange(span: TextSpan, newLength: number): TextChangeRange;
    let unchangedTextChangeRange: TextChangeRange;
    /**
     * Called to merge all the changes that occurred across several versions of a script snapshot
     * into a single change.  i.e. if a user keeps making successive edits to a script we will
     * have a text change from V1 to V2, V2 to V3, ..., Vn.
     *
     * This function will then merge those changes into a single change range valid between V1 and
     * Vn.
     */
    function collapseTextChangeRangesAcrossMultipleVersions(changes: ReadonlyArray<TextChangeRange>): TextChangeRange;
    function getTypeParameterOwner(d: Declaration): Declaration | undefined;
    type ParameterPropertyDeclaration = ParameterDeclaration & {
        parent: ConstructorDeclaration;
        name: Identifier;
    };
    function isParameterPropertyDeclaration(node: Node): node is ParameterPropertyDeclaration;
    function isEmptyBindingPattern(node: BindingName): node is BindingPattern;
    function isEmptyBindingElement(node: BindingElement): boolean;
    function getCombinedModifierFlags(node: Node): ModifierFlags;
    function getCombinedNodeFlags(node: Node): NodeFlags;
    /**
     * Checks to see if the locale is in the appropriate format,
     * and if it is, attempts to set the appropriate language.
     */
    function validateLocaleAndSetLanguage(locale: string, sys: {
        getExecutingFilePath(): string;
        resolvePath(path: string): string;
        fileExists(fileName: string): boolean;
        readFile(fileName: string): string | undefined;
    }, errors?: Push<Diagnostic>): void;
    function getOriginalNode(node: Node): Node;
    function getOriginalNode<T extends Node>(node: Node, nodeTest: (node: Node) => node is T): T;
    function getOriginalNode(node: Node | undefined): Node | undefined;
    function getOriginalNode<T extends Node>(node: Node | undefined, nodeTest: (node: Node | undefined) => node is T): T | undefined;
    /**
     * Gets a value indicating whether a node originated in the parse tree.
     *
     * @param node The node to test.
     */
    function isParseTreeNode(node: Node): boolean;
    /**
     * Gets the original parse tree node for a node.
     *
     * @param node The original node.
     * @returns The original parse tree node if found; otherwise, undefined.
     */
    function getParseTreeNode(node: Node): Node;
    /**
     * Gets the original parse tree node for a node.
     *
     * @param node The original node.
     * @param nodeTest A callback used to ensure the correct type of parse tree node is returned.
     * @returns The original parse tree node if found; otherwise, undefined.
     */
    function getParseTreeNode<T extends Node>(node: Node | undefined, nodeTest?: (node: Node) => node is T): T | undefined;
    /**
     * Remove extra underscore from escaped identifier text content.
     *
     * @param identifier The escaped identifier text.
     * @returns The unescaped identifier text.
     */
    function unescapeLeadingUnderscores(identifier: __String): string;
    function idText(identifier: Identifier): string;
    function symbolName(symbol: Symbol): string;
    /**
     * Remove extra underscore from escaped identifier text content.
     * @deprecated Use `id.text` for the unescaped text.
     * @param identifier The escaped identifier text.
     * @returns The unescaped identifier text.
     */
    function unescapeIdentifier(id: string): string;
    function getNameOfJSDocTypedef(declaration: JSDocTypedefTag): Identifier | undefined;
    function getNameOfDeclaration(declaration: Declaration | Expression): DeclarationName;
    /**
     * Gets the JSDoc parameter tags for the node if present.
     *
     * @remarks Returns any JSDoc param tag that matches the provided
     * parameter, whether a param tag on a containing function
     * expression, or a param tag on a variable declaration whose
     * initializer is the containing function. The tags closest to the
     * node are returned first, so in the previous example, the param
     * tag on the containing function expression would be first.
     *
     * Does not return tags for binding patterns, because JSDoc matches
     * parameters by name and binding patterns do not have a name.
     */
    function getJSDocParameterTags(param: ParameterDeclaration): ReadonlyArray<JSDocParameterTag>;
    /**
     * Return true if the node has JSDoc parameter tags.
     *
     * @remarks Includes parameter tags that are not directly on the node,
     * for example on a variable declaration whose initializer is a function expression.
     */
    function hasJSDocParameterTags(node: FunctionLikeDeclaration | SignatureDeclaration): boolean;
    /** Gets the JSDoc augments tag for the node if present */
    function getJSDocAugmentsTag(node: Node): JSDocAugmentsTag | undefined;
    /** Gets the JSDoc class tag for the node if present */
    function getJSDocClassTag(node: Node): JSDocClassTag | undefined;
    /** Gets the JSDoc this tag for the node if present */
    function getJSDocThisTag(node: Node): JSDocThisTag | undefined;
    /** Gets the JSDoc return tag for the node if present */
    function getJSDocReturnTag(node: Node): JSDocReturnTag | undefined;
    /** Gets the JSDoc template tag for the node if present */
    function getJSDocTemplateTag(node: Node): JSDocTemplateTag | undefined;
    /** Gets the JSDoc type tag for the node if present and valid */
    function getJSDocTypeTag(node: Node): JSDocTypeTag | undefined;
    /**
     * Gets the type node for the node if provided via JSDoc.
     *
     * @remarks The search includes any JSDoc param tag that relates
     * to the provided parameter, for example a type tag on the
     * parameter itself, or a param tag on a containing function
     * expression, or a param tag on a variable declaration whose
     * initializer is the containing function. The tags closest to the
     * node are examined first, so in the previous example, the type
     * tag directly on the node would be returned.
     */
    function getJSDocType(node: Node): TypeNode | undefined;
    /**
     * Gets the return type node for the node if provided via JSDoc's return tag.
     *
     * @remarks `getJSDocReturnTag` just gets the whole JSDoc tag. This function
     * gets the type from inside the braces.
     */
    function getJSDocReturnType(node: Node): TypeNode | undefined;
    /** Get all JSDoc tags related to a node, including those on parent nodes. */
    function getJSDocTags(node: Node): ReadonlyArray<JSDocTag>;
    /** Gets all JSDoc tags of a specified kind, or undefined if not present. */
    function getAllJSDocTagsOfKind(node: Node, kind: SyntaxKind): ReadonlyArray<JSDocTag>;
}
declare namespace ts {
    function isNumericLiteral(node: Node): node is NumericLiteral;
    function isStringLiteral(node: Node): node is StringLiteral;
    function isJsxText(node: Node): node is JsxText;
    function isRegularExpressionLiteral(node: Node): node is RegularExpressionLiteral;
    function isNoSubstitutionTemplateLiteral(node: Node): node is NoSubstitutionTemplateLiteral;
    function isTemplateHead(node: Node): node is TemplateHead;
    function isTemplateMiddle(node: Node): node is TemplateMiddle;
    function isTemplateTail(node: Node): node is TemplateTail;
    function isIdentifier(node: Node): node is Identifier;
    function isQualifiedName(node: Node): node is QualifiedName;
    function isComputedPropertyName(node: Node): node is ComputedPropertyName;
    function isTypeParameterDeclaration(node: Node): node is TypeParameterDeclaration;
    function isParameter(node: Node): node is ParameterDeclaration;
    function isDecorator(node: Node): node is Decorator;
    function isPropertySignature(node: Node): node is PropertySignature;
    function isPropertyDeclaration(node: Node): node is PropertyDeclaration;
    function isMethodSignature(node: Node): node is MethodSignature;
    function isMethodDeclaration(node: Node): node is MethodDeclaration;
    function isConstructorDeclaration(node: Node): node is ConstructorDeclaration;
    function isGetAccessorDeclaration(node: Node): node is GetAccessorDeclaration;
    function isSetAccessorDeclaration(node: Node): node is SetAccessorDeclaration;
    function isCallSignatureDeclaration(node: Node): node is CallSignatureDeclaration;
    function isConstructSignatureDeclaration(node: Node): node is ConstructSignatureDeclaration;
    function isIndexSignatureDeclaration(node: Node): node is IndexSignatureDeclaration;
    function isTypePredicateNode(node: Node): node is TypePredicateNode;
    function isTypeReferenceNode(node: Node): node is TypeReferenceNode;
    function isFunctionTypeNode(node: Node): node is FunctionTypeNode;
    function isConstructorTypeNode(node: Node): node is ConstructorTypeNode;
    function isTypeQueryNode(node: Node): node is TypeQueryNode;
    function isTypeLiteralNode(node: Node): node is TypeLiteralNode;
    function isArrayTypeNode(node: Node): node is ArrayTypeNode;
    function isTupleTypeNode(node: Node): node is TupleTypeNode;
    function isUnionTypeNode(node: Node): node is UnionTypeNode;
    function isIntersectionTypeNode(node: Node): node is IntersectionTypeNode;
    function isConditionalTypeNode(node: Node): node is ConditionalTypeNode;
    function isInferTypeNode(node: Node): node is InferTypeNode;
    function isParenthesizedTypeNode(node: Node): node is ParenthesizedTypeNode;
    function isThisTypeNode(node: Node): node is ThisTypeNode;
    function isTypeOperatorNode(node: Node): node is TypeOperatorNode;
    function isIndexedAccessTypeNode(node: Node): node is IndexedAccessTypeNode;
    function isMappedTypeNode(node: Node): node is MappedTypeNode;
    function isLiteralTypeNode(node: Node): node is LiteralTypeNode;
    function isImportTypeNode(node: Node): node is ImportTypeNode;
    function isObjectBindingPattern(node: Node): node is ObjectBindingPattern;
    function isArrayBindingPattern(node: Node): node is ArrayBindingPattern;
    function isBindingElement(node: Node): node is BindingElement;
    function isArrayLiteralExpression(node: Node): node is ArrayLiteralExpression;
    function isObjectLiteralExpression(node: Node): node is ObjectLiteralExpression;
    function isPropertyAccessExpression(node: Node): node is PropertyAccessExpression;
    function isElementAccessExpression(node: Node): node is ElementAccessExpression;
    function isCallExpression(node: Node): node is CallExpression;
    function isNewExpression(node: Node): node is NewExpression;
    function isTaggedTemplateExpression(node: Node): node is TaggedTemplateExpression;
    function isTypeAssertion(node: Node): node is TypeAssertion;
    function isParenthesizedExpression(node: Node): node is ParenthesizedExpression;
    function skipPartiallyEmittedExpressions(node: Expression): Expression;
    function skipPartiallyEmittedExpressions(node: Node): Node;
    function isFunctionExpression(node: Node): node is FunctionExpression;
    function isArrowFunction(node: Node): node is ArrowFunction;
    function isDeleteExpression(node: Node): node is DeleteExpression;
    function isTypeOfExpression(node: Node): node is TypeOfExpression;
    function isVoidExpression(node: Node): node is VoidExpression;
    function isAwaitExpression(node: Node): node is AwaitExpression;
    function isPrefixUnaryExpression(node: Node): node is PrefixUnaryExpression;
    function isPostfixUnaryExpression(node: Node): node is PostfixUnaryExpression;
    function isBinaryExpression(node: Node): node is BinaryExpression;
    function isConditionalExpression(node: Node): node is ConditionalExpression;
    function isTemplateExpression(node: Node): node is TemplateExpression;
    function isYieldExpression(node: Node): node is YieldExpression;
    function isSpreadElement(node: Node): node is SpreadElement;
    function isClassExpression(node: Node): node is ClassExpression;
    function isOmittedExpression(node: Node): node is OmittedExpression;
    function isExpressionWithTypeArguments(node: Node): node is ExpressionWithTypeArguments;
    function isAsExpression(node: Node): node is AsExpression;
    function isNonNullExpression(node: Node): node is NonNullExpression;
    function isMetaProperty(node: Node): node is MetaProperty;
    function isTemplateSpan(node: Node): node is TemplateSpan;
    function isSemicolonClassElement(node: Node): node is SemicolonClassElement;
    function isBlock(node: Node): node is Block;
    function isVariableStatement(node: Node): node is VariableStatement;
    function isEmptyStatement(node: Node): node is EmptyStatement;
    function isExpressionStatement(node: Node): node is ExpressionStatement;
    function isIfStatement(node: Node): node is IfStatement;
    function isDoStatement(node: Node): node is DoStatement;
    function isWhileStatement(node: Node): node is WhileStatement;
    function isForStatement(node: Node): node is ForStatement;
    function isForInStatement(node: Node): node is ForInStatement;
    function isForOfStatement(node: Node): node is ForOfStatement;
    function isContinueStatement(node: Node): node is ContinueStatement;
    function isBreakStatement(node: Node): node is BreakStatement;
    function isBreakOrContinueStatement(node: Node): node is BreakOrContinueStatement;
    function isReturnStatement(node: Node): node is ReturnStatement;
    function isWithStatement(node: Node): node is WithStatement;
    function isSwitchStatement(node: Node): node is SwitchStatement;
    function isLabeledStatement(node: Node): node is LabeledStatement;
    function isThrowStatement(node: Node): node is ThrowStatement;
    function isTryStatement(node: Node): node is TryStatement;
    function isDebuggerStatement(node: Node): node is DebuggerStatement;
    function isVariableDeclaration(node: Node): node is VariableDeclaration;
    function isVariableDeclarationList(node: Node): node is VariableDeclarationList;
    function isFunctionDeclaration(node: Node): node is FunctionDeclaration;
    function isClassDeclaration(node: Node): node is ClassDeclaration;
    function isInterfaceDeclaration(node: Node): node is InterfaceDeclaration;
    function isTypeAliasDeclaration(node: Node): node is TypeAliasDeclaration;
    function isEnumDeclaration(node: Node): node is EnumDeclaration;
    function isModuleDeclaration(node: Node): node is ModuleDeclaration;
    function isModuleBlock(node: Node): node is ModuleBlock;
    function isCaseBlock(node: Node): node is CaseBlock;
    function isNamespaceExportDeclaration(node: Node): node is NamespaceExportDeclaration;
    function isImportEqualsDeclaration(node: Node): node is ImportEqualsDeclaration;
    function isImportDeclaration(node: Node): node is ImportDeclaration;
    function isImportClause(node: Node): node is ImportClause;
    function isNamespaceImport(node: Node): node is NamespaceImport;
    function isNamedImports(node: Node): node is NamedImports;
    function isImportSpecifier(node: Node): node is ImportSpecifier;
    function isExportAssignment(node: Node): node is ExportAssignment;
    function isExportDeclaration(node: Node): node is ExportDeclaration;
    function isNamedExports(node: Node): node is NamedExports;
    function isExportSpecifier(node: Node): node is ExportSpecifier;
    function isMissingDeclaration(node: Node): node is MissingDeclaration;
    function isExternalModuleReference(node: Node): node is ExternalModuleReference;
    function isJsxElement(node: Node): node is JsxElement;
    function isJsxSelfClosingElement(node: Node): node is JsxSelfClosingElement;
    function isJsxOpeningElement(node: Node): node is JsxOpeningElement;
    function isJsxClosingElement(node: Node): node is JsxClosingElement;
    function isJsxFragment(node: Node): node is JsxFragment;
    function isJsxOpeningFragment(node: Node): node is JsxOpeningFragment;
    function isJsxClosingFragment(node: Node): node is JsxClosingFragment;
    function isJsxAttribute(node: Node): node is JsxAttribute;
    function isJsxAttributes(node: Node): node is JsxAttributes;
    function isJsxSpreadAttribute(node: Node): node is JsxSpreadAttribute;
    function isJsxExpression(node: Node): node is JsxExpression;
    function isCaseClause(node: Node): node is CaseClause;
    function isDefaultClause(node: Node): node is DefaultClause;
    function isHeritageClause(node: Node): node is HeritageClause;
    function isCatchClause(node: Node): node is CatchClause;
    function isPropertyAssignment(node: Node): node is PropertyAssignment;
    function isShorthandPropertyAssignment(node: Node): node is ShorthandPropertyAssignment;
    function isSpreadAssignment(node: Node): node is SpreadAssignment;
    function isEnumMember(node: Node): node is EnumMember;
    function isSourceFile(node: Node): node is SourceFile;
    function isBundle(node: Node): node is Bundle;
    function isUnparsedSource(node: Node): node is UnparsedSource;
    function isJSDocTypeExpression(node: Node): node is JSDocTypeExpression;
    function isJSDocAllType(node: JSDocAllType): node is JSDocAllType;
    function isJSDocUnknownType(node: Node): node is JSDocUnknownType;
    function isJSDocNullableType(node: Node): node is JSDocNullableType;
    function isJSDocNonNullableType(node: Node): node is JSDocNonNullableType;
    function isJSDocOptionalType(node: Node): node is JSDocOptionalType;
    function isJSDocFunctionType(node: Node): node is JSDocFunctionType;
    function isJSDocVariadicType(node: Node): node is JSDocVariadicType;
    function isJSDoc(node: Node): node is JSDoc;
    function isJSDocAugmentsTag(node: Node): node is JSDocAugmentsTag;
    function isJSDocClassTag(node: Node): node is JSDocClassTag;
    function isJSDocThisTag(node: Node): node is JSDocThisTag;
    function isJSDocParameterTag(node: Node): node is JSDocParameterTag;
    function isJSDocReturnTag(node: Node): node is JSDocReturnTag;
    function isJSDocTypeTag(node: Node): node is JSDocTypeTag;
    function isJSDocTemplateTag(node: Node): node is JSDocTemplateTag;
    function isJSDocTypedefTag(node: Node): node is JSDocTypedefTag;
    function isJSDocPropertyTag(node: Node): node is JSDocPropertyTag;
    function isJSDocPropertyLikeTag(node: Node): node is JSDocPropertyLikeTag;
    function isJSDocTypeLiteral(node: Node): node is JSDocTypeLiteral;
    function isJSDocCallbackTag(node: Node): node is JSDocCallbackTag;
    function isJSDocSignature(node: Node): node is JSDocSignature;
}
declare namespace ts {
    /**
     * True if node is of some token syntax kind.
     * For example, this is true for an IfKeyword but not for an IfStatement.
     * Literals are considered tokens, except TemplateLiteral, but does include TemplateHead/Middle/Tail.
     */
    function isToken(n: Node): boolean;
    function isLiteralExpression(node: Node): node is LiteralExpression;
    type TemplateLiteralToken = NoSubstitutionTemplateLiteral | TemplateHead | TemplateMiddle | TemplateTail;
    function isTemplateLiteralToken(node: Node): node is TemplateLiteralToken;
    function isTemplateMiddleOrTemplateTail(node: Node): node is TemplateMiddle | TemplateTail;
    function isStringTextContainingNode(node: Node): node is StringLiteral | TemplateLiteralToken;
    function isModifier(node: Node): node is Modifier;
    function isEntityName(node: Node): node is EntityName;
    function isPropertyName(node: Node): node is PropertyName;
    function isBindingName(node: Node): node is BindingName;
    function isFunctionLike(node: Node): node is SignatureDeclaration;
    function isClassElement(node: Node): node is ClassElement;
    function isClassLike(node: Node): node is ClassLikeDeclaration;
    function isAccessor(node: Node): node is AccessorDeclaration;
    function isTypeElement(node: Node): node is TypeElement;
    function isClassOrTypeElement(node: Node): node is ClassElement | TypeElement;
    function isObjectLiteralElementLike(node: Node): node is ObjectLiteralElementLike;
    /**
     * Node test that determines whether a node is a valid type node.
     * This differs from the `isPartOfTypeNode` function which determines whether a node is *part*
     * of a TypeNode.
     */
    function isTypeNode(node: Node): node is TypeNode;
    function isFunctionOrConstructorTypeNode(node: Node): node is FunctionTypeNode | ConstructorTypeNode;
    function isPropertyAccessOrQualifiedName(node: Node): node is PropertyAccessExpression | QualifiedName;
    function isCallLikeExpression(node: Node): node is CallLikeExpression;
    function isCallOrNewExpression(node: Node): node is CallExpression | NewExpression;
    function isTemplateLiteral(node: Node): node is TemplateLiteral;
    function isAssertionExpression(node: Node): node is AssertionExpression;
    function isIterationStatement(node: Node, lookInLabeledStatements: false): node is IterationStatement;
    function isIterationStatement(node: Node, lookInLabeledStatements: boolean): node is IterationStatement | LabeledStatement;
    function isJsxOpeningLikeElement(node: Node): node is JsxOpeningLikeElement;
    function isCaseOrDefaultClause(node: Node): node is CaseOrDefaultClause;
    /** True if node is of a kind that may contain comment text. */
    function isJSDocCommentContainingNode(node: Node): boolean;
    function isSetAccessor(node: Node): node is SetAccessorDeclaration;
    function isGetAccessor(node: Node): node is GetAccessorDeclaration;
    function isObjectLiteralElement(node: Node): node is ObjectLiteralElement;
    function isStringLiteralLike(node: Node): node is StringLiteralLike;
}
declare namespace ts {
    function createNode(kind: SyntaxKind, pos?: number, end?: number): Node;
    /**
     * Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
     * stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
     * embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
     * a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
     *
     * @param node a given node to visit its children
     * @param cbNode a callback to be invoked for all child nodes
     * @param cbNodes a callback to be invoked for embedded array
     *
     * @remarks `forEachChild` must visit the children of a node in the order
     * that they appear in the source code. The language service depends on this property to locate nodes by position.
     */
    function forEachChild<T>(node: Node, cbNode: (node: Node) => T | undefined, cbNodes?: (nodes: NodeArray<Node>) => T | undefined): T | undefined;
    function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes?: boolean, scriptKind?: ScriptKind): SourceFile;
    function parseIsolatedEntityName(text: string, languageVersion: ScriptTarget): EntityName | undefined;
    /**
     * Parse json text into SyntaxTree and return node and parse errors if any
     * @param fileName
     * @param sourceText
     */
    function parseJsonText(fileName: string, sourceText: string): JsonSourceFile;
    function isExternalModule(file: SourceFile): boolean;
    function updateSourceFile(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks?: boolean): SourceFile;
}
declare namespace ts {
    function parseCommandLine(commandLine: ReadonlyArray<string>, readFile?: (path: string) => string | undefined): ParsedCommandLine;
    type DiagnosticReporter = (diagnostic: Diagnostic) => void;
    /**
     * Reports config file diagnostics
     */
    interface ConfigFileDiagnosticsReporter {
        /**
         * Reports unrecoverable error when parsing config file
         */
        onUnRecoverableConfigFileDiagnostic: DiagnosticReporter;
    }
    /**
     * Interface extending ParseConfigHost to support ParseConfigFile that reads config file and reports errors
     */
    interface ParseConfigFileHost extends ParseConfigHost, ConfigFileDiagnosticsReporter {
        getCurrentDirectory(): string;
    }
    /**
     * Reads the config file, reports errors if any and exits if the config file cannot be found
     */
    function getParsedCommandLineOfConfigFile(configFileName: string, optionsToExtend: CompilerOptions, host: ParseConfigFileHost): ParsedCommandLine | undefined;
    /**
     * Read tsconfig.json file
     * @param fileName The path to the config file
     */
    function readConfigFile(fileName: string, readFile: (path: string) => string | undefined): {
        config?: any;
        error?: Diagnostic;
    };
    /**
     * Parse the text of the tsconfig.json file
     * @param fileName The path to the config file
     * @param jsonText The text of the config file
     */
    function parseConfigFileTextToJson(fileName: string, jsonText: string): {
        config?: any;
        error?: Diagnostic;
    };
    /**
     * Read tsconfig.json file
     * @param fileName The path to the config file
     */
    function readJsonConfigFile(fileName: string, readFile: (path: string) => string | undefined): TsConfigSourceFile;
    /**
     * Convert the json syntax tree into the json value
     */
    function convertToObject(sourceFile: JsonSourceFile, errors: Push<Diagnostic>): any;
    /**
     * Parse the contents of a config file (tsconfig.json).
     * @param json The contents of the config file to parse
     * @param host Instance of ParseConfigHost used to enumerate files in folder.
     * @param basePath A root directory to resolve relative path entries in the config
     *    file to. e.g. outDir
     */
    function parseJsonConfigFileContent(json: any, host: ParseConfigHost, basePath: string, existingOptions?: CompilerOptions, configFileName?: string, resolutionStack?: Path[], extraFileExtensions?: ReadonlyArray<FileExtensionInfo>): ParsedCommandLine;
    /**
     * Parse the contents of a config file (tsconfig.json).
     * @param jsonNode The contents of the config file to parse
     * @param host Instance of ParseConfigHost used to enumerate files in folder.
     * @param basePath A root directory to resolve relative path entries in the config
     *    file to. e.g. outDir
     */
    function parseJsonSourceFileConfigFileContent(sourceFile: TsConfigSourceFile, host: ParseConfigHost, basePath: string, existingOptions?: CompilerOptions, configFileName?: string, resolutionStack?: Path[], extraFileExtensions?: ReadonlyArray<FileExtensionInfo>): ParsedCommandLine;
    function convertCompilerOptionsFromJson(jsonOptions: any, basePath: string, configFileName?: string): {
        options: CompilerOptions;
        errors: Diagnostic[];
    };
    function convertTypeAcquisitionFromJson(jsonOptions: any, basePath: string, configFileName?: string): {
        options: TypeAcquisition;
        errors: Diagnostic[];
    };
}
declare namespace ts {
    function getEffectiveTypeRoots(options: CompilerOptions, host: GetEffectiveTypeRootsHost): string[] | undefined;
    /**
     * @param {string | undefined} containingFile - file that contains type reference directive, can be undefined if containing file is unknown.
     * This is possible in case if resolution is performed for directives specified via 'types' parameter. In this case initial path for secondary lookups
     * is assumed to be the same as root directory of the project.
     */
    function resolveTypeReferenceDirective(typeReferenceDirectiveName: string, containingFile: string | undefined, options: CompilerOptions, host: ModuleResolutionHost): ResolvedTypeReferenceDirectiveWithFailedLookupLocations;
    /**
     * Given a set of options, returns the set of type directive names
     *   that should be included for this program automatically.
     * This list could either come from the config file,
     *   or from enumerating the types root + initial secondary types lookup location.
     * More type directives might appear in the program later as a result of loading actual source files;
     *   this list is only the set of defaults that are implicitly included.
     */
    function getAutomaticTypeDirectiveNames(options: CompilerOptions, host: ModuleResolutionHost): string[];
    /**
     * Cached module resolutions per containing directory.
     * This assumes that any module id will have the same resolution for sibling files located in the same folder.
     */
    interface ModuleResolutionCache extends NonRelativeModuleNameResolutionCache {
        getOrCreateCacheForDirectory(directoryName: string): Map<ResolvedModuleWithFailedLookupLocations>;
    }
    /**
     * Stored map from non-relative module name to a table: directory -> result of module lookup in this directory
     * We support only non-relative module names because resolution of relative module names is usually more deterministic and thus less expensive.
     */
    interface NonRelativeModuleNameResolutionCache {
        getOrCreateCacheForModuleName(nonRelativeModuleName: string): PerModuleNameCache;
    }
    interface PerModuleNameCache {
        get(directory: string): ResolvedModuleWithFailedLookupLocations | undefined;
        set(directory: string, result: ResolvedModuleWithFailedLookupLocations): void;
    }
    function createModuleResolutionCache(currentDirectory: string, getCanonicalFileName: (s: string) => string): ModuleResolutionCache;
    function resolveModuleNameFromCache(moduleName: string, containingFile: string, cache: ModuleResolutionCache): ResolvedModuleWithFailedLookupLocations | undefined;
    function resolveModuleName(moduleName: string, containingFile: string, compilerOptions: CompilerOptions, host: ModuleResolutionHost, cache?: ModuleResolutionCache): ResolvedModuleWithFailedLookupLocations;
    function nodeModuleNameResolver(moduleName: string, containingFile: string, compilerOptions: CompilerOptions, host: ModuleResolutionHost, cache?: ModuleResolutionCache): ResolvedModuleWithFailedLookupLocations;
    function classicNameResolver(moduleName: string, containingFile: string, compilerOptions: CompilerOptions, host: ModuleResolutionHost, cache?: NonRelativeModuleNameResolutionCache): ResolvedModuleWithFailedLookupLocations;
}
declare namespace ts {
    function createNodeArray<T extends Node>(elements?: ReadonlyArray<T>, hasTrailingComma?: boolean): NodeArray<T>;
    /** If a node is passed, creates a string literal whose source text is read from a source node during emit. */
    function createLiteral(value: string | StringLiteral | NoSubstitutionTemplateLiteral | NumericLiteral | Identifier): StringLiteral;
    function createLiteral(value: number): NumericLiteral;
    function createLiteral(value: boolean): BooleanLiteral;
    function createLiteral(value: string | number | boolean): PrimaryExpression;
    function createNumericLiteral(value: string): NumericLiteral;
    function createStringLiteral(text: string): StringLiteral;
    function createRegularExpressionLiteral(text: string): RegularExpressionLiteral;
    function createIdentifier(text: string): Identifier;
    function updateIdentifier(node: Identifier): Identifier;
    /** Create a unique temporary variable. */
    function createTempVariable(recordTempVariable: ((node: Identifier) => void) | undefined): Identifier;
    /** Create a unique temporary variable for use in a loop. */
    function createLoopVariable(): Identifier;
    /** Create a unique name based on the supplied text. */
    function createUniqueName(text: string): Identifier;
    /** Create a unique name based on the supplied text. */
    function createOptimisticUniqueName(text: string): Identifier;
    /** Create a unique name based on the supplied text. This does not consider names injected by the transformer. */
    function createFileLevelUniqueName(text: string): Identifier;
    /** Create a unique name generated for a node. */
    function getGeneratedNameForNode(node: Node): Identifier;
    function createToken<TKind extends SyntaxKind>(token: TKind): Token<TKind>;
    function createSuper(): SuperExpression;
    function createThis(): ThisExpression & Token<SyntaxKind.ThisKeyword>;
    function createNull(): NullLiteral & Token<SyntaxKind.NullKeyword>;
    function createTrue(): BooleanLiteral & Token<SyntaxKind.TrueKeyword>;
    function createFalse(): BooleanLiteral & Token<SyntaxKind.FalseKeyword>;
    function createModifier<T extends Modifier["kind"]>(kind: T): Token<T>;
    function createModifiersFromModifierFlags(flags: ModifierFlags): Modifier[];
    function createQualifiedName(left: EntityName, right: string | Identifier): QualifiedName;
    function updateQualifiedName(node: QualifiedName, left: EntityName, right: Identifier): QualifiedName;
    function createComputedPropertyName(expression: Expression): ComputedPropertyName;
    function updateComputedPropertyName(node: ComputedPropertyName, expression: Expression): ComputedPropertyName;
    function createTypeParameterDeclaration(name: string | Identifier, constraint?: TypeNode, defaultType?: TypeNode): TypeParameterDeclaration;
    function updateTypeParameterDeclaration(node: TypeParameterDeclaration, name: Identifier, constraint: TypeNode | undefined, defaultType: TypeNode | undefined): TypeParameterDeclaration;
    function createParameter(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken?: QuestionToken, type?: TypeNode, initializer?: Expression): ParameterDeclaration;
    function updateParameter(node: ParameterDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, dotDotDotToken: DotDotDotToken | undefined, name: string | BindingName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): ParameterDeclaration;
    function createDecorator(expression: Expression): Decorator;
    function updateDecorator(node: Decorator, expression: Expression): Decorator;
    function createPropertySignature(modifiers: ReadonlyArray<Modifier> | undefined, name: PropertyName | string, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): PropertySignature;
    function updatePropertySignature(node: PropertySignature, modifiers: ReadonlyArray<Modifier> | undefined, name: PropertyName, questionToken: QuestionToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): PropertySignature;
    function createProperty(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | PropertyName, questionOrExclamationToken: QuestionToken | ExclamationToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): PropertyDeclaration;
    function updateProperty(node: PropertyDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | PropertyName, questionOrExclamationToken: QuestionToken | ExclamationToken | undefined, type: TypeNode | undefined, initializer: Expression | undefined): PropertyDeclaration;
    function createMethodSignature(typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, name: string | PropertyName, questionToken: QuestionToken | undefined): MethodSignature;
    function updateMethodSignature(node: MethodSignature, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined, name: PropertyName, questionToken: QuestionToken | undefined): MethodSignature;
    function createMethod(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: string | PropertyName, questionToken: QuestionToken | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): MethodDeclaration;
    function updateMethod(node: MethodDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: PropertyName, questionToken: QuestionToken | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): MethodDeclaration;
    function createConstructor(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, body: Block | undefined): ConstructorDeclaration;
    function updateConstructor(node: ConstructorDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, body: Block | undefined): ConstructorDeclaration;
    function createGetAccessor(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | PropertyName, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): GetAccessorDeclaration;
    function updateGetAccessor(node: GetAccessorDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: PropertyName, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): GetAccessorDeclaration;
    function createSetAccessor(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | PropertyName, parameters: ReadonlyArray<ParameterDeclaration>, body: Block | undefined): SetAccessorDeclaration;
    function updateSetAccessor(node: SetAccessorDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: PropertyName, parameters: ReadonlyArray<ParameterDeclaration>, body: Block | undefined): SetAccessorDeclaration;
    function createCallSignature(typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined): CallSignatureDeclaration;
    function updateCallSignature(node: CallSignatureDeclaration, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined): CallSignatureDeclaration;
    function createConstructSignature(typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined): ConstructSignatureDeclaration;
    function updateConstructSignature(node: ConstructSignatureDeclaration, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined): ConstructSignatureDeclaration;
    function createIndexSignature(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode): IndexSignatureDeclaration;
    function updateIndexSignature(node: IndexSignatureDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode): IndexSignatureDeclaration;
    function createKeywordTypeNode(kind: KeywordTypeNode["kind"]): KeywordTypeNode;
    function createTypePredicateNode(parameterName: Identifier | ThisTypeNode | string, type: TypeNode): TypePredicateNode;
    function updateTypePredicateNode(node: TypePredicateNode, parameterName: Identifier | ThisTypeNode, type: TypeNode): TypePredicateNode;
    function createTypeReferenceNode(typeName: string | EntityName, typeArguments: ReadonlyArray<TypeNode> | undefined): TypeReferenceNode;
    function updateTypeReferenceNode(node: TypeReferenceNode, typeName: EntityName, typeArguments: NodeArray<TypeNode> | undefined): TypeReferenceNode;
    function createFunctionTypeNode(typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined): FunctionTypeNode;
    function updateFunctionTypeNode(node: FunctionTypeNode, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined): FunctionTypeNode;
    function createConstructorTypeNode(typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined): ConstructorTypeNode;
    function updateConstructorTypeNode(node: ConstructorTypeNode, typeParameters: NodeArray<TypeParameterDeclaration> | undefined, parameters: NodeArray<ParameterDeclaration>, type: TypeNode | undefined): ConstructorTypeNode;
    function createTypeQueryNode(exprName: EntityName): TypeQueryNode;
    function updateTypeQueryNode(node: TypeQueryNode, exprName: EntityName): TypeQueryNode;
    function createTypeLiteralNode(members: ReadonlyArray<TypeElement> | undefined): TypeLiteralNode;
    function updateTypeLiteralNode(node: TypeLiteralNode, members: NodeArray<TypeElement>): TypeLiteralNode;
    function createArrayTypeNode(elementType: TypeNode): ArrayTypeNode;
    function updateArrayTypeNode(node: ArrayTypeNode, elementType: TypeNode): ArrayTypeNode;
    function createTupleTypeNode(elementTypes: ReadonlyArray<TypeNode>): TupleTypeNode;
    function updateTypleTypeNode(node: TupleTypeNode, elementTypes: ReadonlyArray<TypeNode>): TupleTypeNode;
    function createUnionTypeNode(types: ReadonlyArray<TypeNode>): UnionTypeNode;
    function updateUnionTypeNode(node: UnionTypeNode, types: NodeArray<TypeNode>): UnionTypeNode;
    function createIntersectionTypeNode(types: ReadonlyArray<TypeNode>): IntersectionTypeNode;
    function updateIntersectionTypeNode(node: IntersectionTypeNode, types: NodeArray<TypeNode>): IntersectionTypeNode;
    function createUnionOrIntersectionTypeNode(kind: SyntaxKind.UnionType | SyntaxKind.IntersectionType, types: ReadonlyArray<TypeNode>): UnionOrIntersectionTypeNode;
    function createConditionalTypeNode(checkType: TypeNode, extendsType: TypeNode, trueType: TypeNode, falseType: TypeNode): ConditionalTypeNode;
    function updateConditionalTypeNode(node: ConditionalTypeNode, checkType: TypeNode, extendsType: TypeNode, trueType: TypeNode, falseType: TypeNode): ConditionalTypeNode;
    function createInferTypeNode(typeParameter: TypeParameterDeclaration): InferTypeNode;
    function updateInferTypeNode(node: InferTypeNode, typeParameter: TypeParameterDeclaration): InferTypeNode;
    function createImportTypeNode(argument: TypeNode, qualifier?: EntityName, typeArguments?: ReadonlyArray<TypeNode>, isTypeOf?: boolean): ImportTypeNode;
    function updateImportTypeNode(node: ImportTypeNode, argument: TypeNode, qualifier?: EntityName, typeArguments?: ReadonlyArray<TypeNode>, isTypeOf?: boolean): ImportTypeNode;
    function createParenthesizedType(type: TypeNode): ParenthesizedTypeNode;
    function updateParenthesizedType(node: ParenthesizedTypeNode, type: TypeNode): ParenthesizedTypeNode;
    function createThisTypeNode(): ThisTypeNode;
    function createTypeOperatorNode(type: TypeNode): TypeOperatorNode;
    function createTypeOperatorNode(operator: SyntaxKind.KeyOfKeyword | SyntaxKind.UniqueKeyword, type: TypeNode): TypeOperatorNode;
    function updateTypeOperatorNode(node: TypeOperatorNode, type: TypeNode): TypeOperatorNode;
    function createIndexedAccessTypeNode(objectType: TypeNode, indexType: TypeNode): IndexedAccessTypeNode;
    function updateIndexedAccessTypeNode(node: IndexedAccessTypeNode, objectType: TypeNode, indexType: TypeNode): IndexedAccessTypeNode;
    function createMappedTypeNode(readonlyToken: ReadonlyToken | PlusToken | MinusToken | undefined, typeParameter: TypeParameterDeclaration, questionToken: QuestionToken | PlusToken | MinusToken | undefined, type: TypeNode | undefined): MappedTypeNode;
    function updateMappedTypeNode(node: MappedTypeNode, readonlyToken: ReadonlyToken | PlusToken | MinusToken | undefined, typeParameter: TypeParameterDeclaration, questionToken: QuestionToken | PlusToken | MinusToken | undefined, type: TypeNode | undefined): MappedTypeNode;
    function createLiteralTypeNode(literal: LiteralTypeNode["literal"]): LiteralTypeNode;
    function updateLiteralTypeNode(node: LiteralTypeNode, literal: LiteralTypeNode["literal"]): LiteralTypeNode;
    function createObjectBindingPattern(elements: ReadonlyArray<BindingElement>): ObjectBindingPattern;
    function updateObjectBindingPattern(node: ObjectBindingPattern, elements: ReadonlyArray<BindingElement>): ObjectBindingPattern;
    function createArrayBindingPattern(elements: ReadonlyArray<ArrayBindingElement>): ArrayBindingPattern;
    function updateArrayBindingPattern(node: ArrayBindingPattern, elements: ReadonlyArray<ArrayBindingElement>): ArrayBindingPattern;
    function createBindingElement(dotDotDotToken: DotDotDotToken | undefined, propertyName: string | PropertyName | undefined, name: string | BindingName, initializer?: Expression): BindingElement;
    function updateBindingElement(node: BindingElement, dotDotDotToken: DotDotDotToken | undefined, propertyName: PropertyName | undefined, name: BindingName, initializer: Expression | undefined): BindingElement;
    function createArrayLiteral(elements?: ReadonlyArray<Expression>, multiLine?: boolean): ArrayLiteralExpression;
    function updateArrayLiteral(node: ArrayLiteralExpression, elements: ReadonlyArray<Expression>): ArrayLiteralExpression;
    function createObjectLiteral(properties?: ReadonlyArray<ObjectLiteralElementLike>, multiLine?: boolean): ObjectLiteralExpression;
    function updateObjectLiteral(node: ObjectLiteralExpression, properties: ReadonlyArray<ObjectLiteralElementLike>): ObjectLiteralExpression;
    function createPropertyAccess(expression: Expression, name: string | Identifier | undefined): PropertyAccessExpression;
    function updatePropertyAccess(node: PropertyAccessExpression, expression: Expression, name: Identifier): PropertyAccessExpression;
    function createElementAccess(expression: Expression, index: number | Expression): ElementAccessExpression;
    function updateElementAccess(node: ElementAccessExpression, expression: Expression, argumentExpression: Expression): ElementAccessExpression;
    function createCall(expression: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, argumentsArray: ReadonlyArray<Expression> | undefined): CallExpression;
    function updateCall(node: CallExpression, expression: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, argumentsArray: ReadonlyArray<Expression>): CallExpression;
    function createNew(expression: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, argumentsArray: ReadonlyArray<Expression> | undefined): NewExpression;
    function updateNew(node: NewExpression, expression: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, argumentsArray: ReadonlyArray<Expression> | undefined): NewExpression;
    function createTaggedTemplate(tag: Expression, template: TemplateLiteral): TaggedTemplateExpression;
    function createTaggedTemplate(tag: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, template: TemplateLiteral): TaggedTemplateExpression;
    function updateTaggedTemplate(node: TaggedTemplateExpression, tag: Expression, template: TemplateLiteral): TaggedTemplateExpression;
    function updateTaggedTemplate(node: TaggedTemplateExpression, tag: Expression, typeArguments: ReadonlyArray<TypeNode> | undefined, template: TemplateLiteral): TaggedTemplateExpression;
    function createTypeAssertion(type: TypeNode, expression: Expression): TypeAssertion;
    function updateTypeAssertion(node: TypeAssertion, type: TypeNode, expression: Expression): TypeAssertion;
    function createParen(expression: Expression): ParenthesizedExpression;
    function updateParen(node: ParenthesizedExpression, expression: Expression): ParenthesizedExpression;
    function createFunctionExpression(modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: string | Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration> | undefined, type: TypeNode | undefined, body: Block): FunctionExpression;
    function updateFunctionExpression(node: FunctionExpression, modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block): FunctionExpression;
    function createArrowFunction(modifiers: ReadonlyArray<Modifier> | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, equalsGreaterThanToken: EqualsGreaterThanToken | undefined, body: ConciseBody): ArrowFunction;
    function updateArrowFunction(node: ArrowFunction, modifiers: ReadonlyArray<Modifier> | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: ConciseBody): ArrowFunction;
    function updateArrowFunction(node: ArrowFunction, modifiers: ReadonlyArray<Modifier> | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, equalsGreaterThanToken: Token<SyntaxKind.EqualsGreaterThanToken>, body: ConciseBody): ArrowFunction;
    function createDelete(expression: Expression): DeleteExpression;
    function updateDelete(node: DeleteExpression, expression: Expression): DeleteExpression;
    function createTypeOf(expression: Expression): TypeOfExpression;
    function updateTypeOf(node: TypeOfExpression, expression: Expression): TypeOfExpression;
    function createVoid(expression: Expression): VoidExpression;
    function updateVoid(node: VoidExpression, expression: Expression): VoidExpression;
    function createAwait(expression: Expression): AwaitExpression;
    function updateAwait(node: AwaitExpression, expression: Expression): AwaitExpression;
    function createPrefix(operator: PrefixUnaryOperator, operand: Expression): PrefixUnaryExpression;
    function updatePrefix(node: PrefixUnaryExpression, operand: Expression): PrefixUnaryExpression;
    function createPostfix(operand: Expression, operator: PostfixUnaryOperator): PostfixUnaryExpression;
    function updatePostfix(node: PostfixUnaryExpression, operand: Expression): PostfixUnaryExpression;
    function createBinary(left: Expression, operator: BinaryOperator | BinaryOperatorToken, right: Expression): BinaryExpression;
    function updateBinary(node: BinaryExpression, left: Expression, right: Expression, operator?: BinaryOperator | BinaryOperatorToken): BinaryExpression;
    function createConditional(condition: Expression, whenTrue: Expression, whenFalse: Expression): ConditionalExpression;
    function createConditional(condition: Expression, questionToken: QuestionToken, whenTrue: Expression, colonToken: ColonToken, whenFalse: Expression): ConditionalExpression;
    function updateConditional(node: ConditionalExpression, condition: Expression, whenTrue: Expression, whenFalse: Expression): ConditionalExpression;
    function updateConditional(node: ConditionalExpression, condition: Expression, questionToken: Token<SyntaxKind.QuestionToken>, whenTrue: Expression, colonToken: Token<SyntaxKind.ColonToken>, whenFalse: Expression): ConditionalExpression;
    function createTemplateExpression(head: TemplateHead, templateSpans: ReadonlyArray<TemplateSpan>): TemplateExpression;
    function updateTemplateExpression(node: TemplateExpression, head: TemplateHead, templateSpans: ReadonlyArray<TemplateSpan>): TemplateExpression;
    function createTemplateHead(text: string): TemplateHead;
    function createTemplateMiddle(text: string): TemplateMiddle;
    function createTemplateTail(text: string): TemplateTail;
    function createNoSubstitutionTemplateLiteral(text: string): NoSubstitutionTemplateLiteral;
    function createYield(expression?: Expression): YieldExpression;
    function createYield(asteriskToken: AsteriskToken | undefined, expression: Expression): YieldExpression;
    function updateYield(node: YieldExpression, asteriskToken: AsteriskToken | undefined, expression: Expression): YieldExpression;
    function createSpread(expression: Expression): SpreadElement;
    function updateSpread(node: SpreadElement, expression: Expression): SpreadElement;
    function createClassExpression(modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<ClassElement>): ClassExpression;
    function updateClassExpression(node: ClassExpression, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<ClassElement>): ClassExpression;
    function createOmittedExpression(): OmittedExpression;
    function createExpressionWithTypeArguments(typeArguments: ReadonlyArray<TypeNode> | undefined, expression: Expression): ExpressionWithTypeArguments;
    function updateExpressionWithTypeArguments(node: ExpressionWithTypeArguments, typeArguments: ReadonlyArray<TypeNode> | undefined, expression: Expression): ExpressionWithTypeArguments;
    function createAsExpression(expression: Expression, type: TypeNode): AsExpression;
    function updateAsExpression(node: AsExpression, expression: Expression, type: TypeNode): AsExpression;
    function createNonNullExpression(expression: Expression): NonNullExpression;
    function updateNonNullExpression(node: NonNullExpression, expression: Expression): NonNullExpression;
    function createMetaProperty(keywordToken: MetaProperty["keywordToken"], name: Identifier): MetaProperty;
    function updateMetaProperty(node: MetaProperty, name: Identifier): MetaProperty;
    function createTemplateSpan(expression: Expression, literal: TemplateMiddle | TemplateTail): TemplateSpan;
    function updateTemplateSpan(node: TemplateSpan, expression: Expression, literal: TemplateMiddle | TemplateTail): TemplateSpan;
    function createSemicolonClassElement(): SemicolonClassElement;
    function createBlock(statements: ReadonlyArray<Statement>, multiLine?: boolean): Block;
    function updateBlock(node: Block, statements: ReadonlyArray<Statement>): Block;
    function createVariableStatement(modifiers: ReadonlyArray<Modifier> | undefined, declarationList: VariableDeclarationList | ReadonlyArray<VariableDeclaration>): VariableStatement;
    function updateVariableStatement(node: VariableStatement, modifiers: ReadonlyArray<Modifier> | undefined, declarationList: VariableDeclarationList): VariableStatement;
    function createEmptyStatement(): EmptyStatement;
    function createStatement(expression: Expression): ExpressionStatement;
    function updateStatement(node: ExpressionStatement, expression: Expression): ExpressionStatement;
    function createIf(expression: Expression, thenStatement: Statement, elseStatement?: Statement): IfStatement;
    function updateIf(node: IfStatement, expression: Expression, thenStatement: Statement, elseStatement: Statement | undefined): IfStatement;
    function createDo(statement: Statement, expression: Expression): DoStatement;
    function updateDo(node: DoStatement, statement: Statement, expression: Expression): DoStatement;
    function createWhile(expression: Expression, statement: Statement): WhileStatement;
    function updateWhile(node: WhileStatement, expression: Expression, statement: Statement): WhileStatement;
    function createFor(initializer: ForInitializer | undefined, condition: Expression | undefined, incrementor: Expression | undefined, statement: Statement): ForStatement;
    function updateFor(node: ForStatement, initializer: ForInitializer | undefined, condition: Expression | undefined, incrementor: Expression | undefined, statement: Statement): ForStatement;
    function createForIn(initializer: ForInitializer, expression: Expression, statement: Statement): ForInStatement;
    function updateForIn(node: ForInStatement, initializer: ForInitializer, expression: Expression, statement: Statement): ForInStatement;
    function createForOf(awaitModifier: AwaitKeywordToken | undefined, initializer: ForInitializer, expression: Expression, statement: Statement): ForOfStatement;
    function updateForOf(node: ForOfStatement, awaitModifier: AwaitKeywordToken | undefined, initializer: ForInitializer, expression: Expression, statement: Statement): ForOfStatement;
    function createContinue(label?: string | Identifier): ContinueStatement;
    function updateContinue(node: ContinueStatement, label: Identifier | undefined): ContinueStatement;
    function createBreak(label?: string | Identifier): BreakStatement;
    function updateBreak(node: BreakStatement, label: Identifier | undefined): BreakStatement;
    function createReturn(expression?: Expression): ReturnStatement;
    function updateReturn(node: ReturnStatement, expression: Expression | undefined): ReturnStatement;
    function createWith(expression: Expression, statement: Statement): WithStatement;
    function updateWith(node: WithStatement, expression: Expression, statement: Statement): WithStatement;
    function createSwitch(expression: Expression, caseBlock: CaseBlock): SwitchStatement;
    function updateSwitch(node: SwitchStatement, expression: Expression, caseBlock: CaseBlock): SwitchStatement;
    function createLabel(label: string | Identifier, statement: Statement): LabeledStatement;
    function updateLabel(node: LabeledStatement, label: Identifier, statement: Statement): LabeledStatement;
    function createThrow(expression: Expression): ThrowStatement;
    function updateThrow(node: ThrowStatement, expression: Expression): ThrowStatement;
    function createTry(tryBlock: Block, catchClause: CatchClause | undefined, finallyBlock: Block | undefined): TryStatement;
    function updateTry(node: TryStatement, tryBlock: Block, catchClause: CatchClause | undefined, finallyBlock: Block | undefined): TryStatement;
    function createDebuggerStatement(): DebuggerStatement;
    function createVariableDeclaration(name: string | BindingName, type?: TypeNode, initializer?: Expression): VariableDeclaration;
    function updateVariableDeclaration(node: VariableDeclaration, name: BindingName, type: TypeNode | undefined, initializer: Expression | undefined): VariableDeclaration;
    function createVariableDeclarationList(declarations: ReadonlyArray<VariableDeclaration>, flags?: NodeFlags): VariableDeclarationList;
    function updateVariableDeclarationList(node: VariableDeclarationList, declarations: ReadonlyArray<VariableDeclaration>): VariableDeclarationList;
    function createFunctionDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: string | Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): FunctionDeclaration;
    function updateFunctionDeclaration(node: FunctionDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, asteriskToken: AsteriskToken | undefined, name: Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, parameters: ReadonlyArray<ParameterDeclaration>, type: TypeNode | undefined, body: Block | undefined): FunctionDeclaration;
    function createClassDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<ClassElement>): ClassDeclaration;
    function updateClassDeclaration(node: ClassDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier | undefined, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<ClassElement>): ClassDeclaration;
    function createInterfaceDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<TypeElement>): InterfaceDeclaration;
    function updateInterfaceDeclaration(node: InterfaceDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, heritageClauses: ReadonlyArray<HeritageClause> | undefined, members: ReadonlyArray<TypeElement>): InterfaceDeclaration;
    function createTypeAliasDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, type: TypeNode): TypeAliasDeclaration;
    function updateTypeAliasDeclaration(node: TypeAliasDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier, typeParameters: ReadonlyArray<TypeParameterDeclaration> | undefined, type: TypeNode): TypeAliasDeclaration;
    function createEnumDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier, members: ReadonlyArray<EnumMember>): EnumDeclaration;
    function updateEnumDeclaration(node: EnumDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier, members: ReadonlyArray<EnumMember>): EnumDeclaration;
    function createModuleDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: ModuleName, body: ModuleBody | undefined, flags?: NodeFlags): ModuleDeclaration;
    function updateModuleDeclaration(node: ModuleDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: ModuleName, body: ModuleBody | undefined): ModuleDeclaration;
    function createModuleBlock(statements: ReadonlyArray<Statement>): ModuleBlock;
    function updateModuleBlock(node: ModuleBlock, statements: ReadonlyArray<Statement>): ModuleBlock;
    function createCaseBlock(clauses: ReadonlyArray<CaseOrDefaultClause>): CaseBlock;
    function updateCaseBlock(node: CaseBlock, clauses: ReadonlyArray<CaseOrDefaultClause>): CaseBlock;
    function createNamespaceExportDeclaration(name: string | Identifier): NamespaceExportDeclaration;
    function updateNamespaceExportDeclaration(node: NamespaceExportDeclaration, name: Identifier): NamespaceExportDeclaration;
    function createImportEqualsDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: string | Identifier, moduleReference: ModuleReference): ImportEqualsDeclaration;
    function updateImportEqualsDeclaration(node: ImportEqualsDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, name: Identifier, moduleReference: ModuleReference): ImportEqualsDeclaration;
    function createImportDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, importClause: ImportClause | undefined, moduleSpecifier: Expression): ImportDeclaration;
    function updateImportDeclaration(node: ImportDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, importClause: ImportClause | undefined, moduleSpecifier: Expression): ImportDeclaration;
    function createImportClause(name: Identifier | undefined, namedBindings: NamedImportBindings | undefined): ImportClause;
    function updateImportClause(node: ImportClause, name: Identifier | undefined, namedBindings: NamedImportBindings | undefined): ImportClause;
    function createNamespaceImport(name: Identifier): NamespaceImport;
    function updateNamespaceImport(node: NamespaceImport, name: Identifier): NamespaceImport;
    function createNamedImports(elements: ReadonlyArray<ImportSpecifier>): NamedImports;
    function updateNamedImports(node: NamedImports, elements: ReadonlyArray<ImportSpecifier>): NamedImports;
    function createImportSpecifier(propertyName: Identifier | undefined, name: Identifier): ImportSpecifier;
    function updateImportSpecifier(node: ImportSpecifier, propertyName: Identifier | undefined, name: Identifier): ImportSpecifier;
    function createExportAssignment(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, isExportEquals: boolean | undefined, expression: Expression): ExportAssignment;
    function updateExportAssignment(node: ExportAssignment, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, expression: Expression): ExportAssignment;
    function createExportDeclaration(decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, exportClause: NamedExports | undefined, moduleSpecifier?: Expression): ExportDeclaration;
    function updateExportDeclaration(node: ExportDeclaration, decorators: ReadonlyArray<Decorator> | undefined, modifiers: ReadonlyArray<Modifier> | undefined, exportClause: NamedExports | undefined, moduleSpecifier: Expression | undefined): ExportDeclaration;
    function createNamedExports(elements: ReadonlyArray<ExportSpecifier>): NamedExports;
    function updateNamedExports(node: NamedExports, elements: ReadonlyArray<ExportSpecifier>): NamedExports;
    function createExportSpecifier(propertyName: string | Identifier | undefined, name: string | Identifier): ExportSpecifier;
    function updateExportSpecifier(node: ExportSpecifier, propertyName: Identifier | undefined, name: Identifier): ExportSpecifier;
    function createExternalModuleReference(expression: Expression): ExternalModuleReference;
    function updateExternalModuleReference(node: ExternalModuleReference, expression: Expression): ExternalModuleReference;
    function createJsxElement(openingElement: JsxOpeningElement, children: ReadonlyArray<JsxChild>, closingElement: JsxClosingElement): JsxElement;
    function updateJsxElement(node: JsxElement, openingElement: JsxOpeningElement, children: ReadonlyArray<JsxChild>, closingElement: JsxClosingElement): JsxElement;
    function createJsxSelfClosingElement(tagName: JsxTagNameExpression, typeArguments: ReadonlyArray<TypeNode> | undefined, attributes: JsxAttributes): JsxSelfClosingElement;
    function updateJsxSelfClosingElement(node: JsxSelfClosingElement, tagName: JsxTagNameExpression, typeArguments: ReadonlyArray<TypeNode> | undefined, attributes: JsxAttributes): JsxSelfClosingElement;
    function createJsxOpeningElement(tagName: JsxTagNameExpression, typeArguments: ReadonlyArray<TypeNode> | undefined, attributes: JsxAttributes): JsxOpeningElement;
    function updateJsxOpeningElement(node: JsxOpeningElement, tagName: JsxTagNameExpression, typeArguments: ReadonlyArray<TypeNode> | undefined, attributes: JsxAttributes): JsxOpeningElement;
    function createJsxClosingElement(tagName: JsxTagNameExpression): JsxClosingElement;
    function updateJsxClosingElement(node: JsxClosingElement, tagName: JsxTagNameExpression): JsxClosingElement;
    function createJsxFragment(openingFragment: JsxOpeningFragment, children: ReadonlyArray<JsxChild>, closingFragment: JsxClosingFragment): JsxFragment;
    function updateJsxFragment(node: JsxFragment, openingFragment: JsxOpeningFragment, children: ReadonlyArray<JsxChild>, closingFragment: JsxClosingFragment): JsxFragment;
    function createJsxAttribute(name: Identifier, initializer: StringLiteral | JsxExpression): JsxAttribute;
    function updateJsxAttribute(node: JsxAttribute, name: Identifier, initializer: StringLiteral | JsxExpression): JsxAttribute;
    function createJsxAttributes(properties: ReadonlyArray<JsxAttributeLike>): JsxAttributes;
    function updateJsxAttributes(node: JsxAttributes, properties: ReadonlyArray<JsxAttributeLike>): JsxAttributes;
    function createJsxSpreadAttribute(expression: Expression): JsxSpreadAttribute;
    function updateJsxSpreadAttribute(node: JsxSpreadAttribute, expression: Expression): JsxSpreadAttribute;
    function createJsxExpression(dotDotDotToken: DotDotDotToken | undefined, expression: Expression | undefined): JsxExpression;
    function updateJsxExpression(node: JsxExpression, expression: Expression | undefined): JsxExpression;
    function createCaseClause(expression: Expression, statements: ReadonlyArray<Statement>): CaseClause;
    function updateCaseClause(node: CaseClause, expression: Expression, statements: ReadonlyArray<Statement>): CaseClause;
    function createDefaultClause(statements: ReadonlyArray<Statement>): DefaultClause;
    function updateDefaultClause(node: DefaultClause, statements: ReadonlyArray<Statement>): DefaultClause;
    function createHeritageClause(token: HeritageClause["token"], types: ReadonlyArray<ExpressionWithTypeArguments>): HeritageClause;
    function updateHeritageClause(node: HeritageClause, types: ReadonlyArray<ExpressionWithTypeArguments>): HeritageClause;
    function createCatchClause(variableDeclaration: string | VariableDeclaration | undefined, block: Block): CatchClause;
    function updateCatchClause(node: CatchClause, variableDeclaration: VariableDeclaration | undefined, block: Block): CatchClause;
    function createPropertyAssignment(name: string | PropertyName, initializer: Expression): PropertyAssignment;
    function updatePropertyAssignment(node: PropertyAssignment, name: PropertyName, initializer: Expression): PropertyAssignment;
    function createShorthandPropertyAssignment(name: string | Identifier, objectAssignmentInitializer?: Expression): ShorthandPropertyAssignment;
    function updateShorthandPropertyAssignment(node: ShorthandPropertyAssignment, name: Identifier, objectAssignmentInitializer: Expression | undefined): ShorthandPropertyAssignment;
    function createSpreadAssignment(expression: Expression): SpreadAssignment;
    function updateSpreadAssignment(node: SpreadAssignment, expression: Expression): SpreadAssignment;
    function createEnumMember(name: string | PropertyName, initializer?: Expression): EnumMember;
    function updateEnumMember(node: EnumMember, name: PropertyName, initializer: Expression | undefined): EnumMember;
    function updateSourceFileNode(node: SourceFile, statements: ReadonlyArray<Statement>, isDeclarationFile?: boolean, referencedFiles?: SourceFile["referencedFiles"], typeReferences?: SourceFile["typeReferenceDirectives"], hasNoDefaultLib?: boolean, libReferences?: SourceFile["libReferenceDirectives"]): SourceFile;
    /**
     * Creates a shallow, memberwise clone of a node for mutation.
     */
    function getMutableClone<T extends Node>(node: T): T;
    /**
     * Creates a synthetic statement to act as a placeholder for a not-emitted statement in
     * order to preserve comments.
     *
     * @param original The original statement.
     */
    function createNotEmittedStatement(original: Node): NotEmittedStatement;
    /**
     * Creates a synthetic expression to act as a placeholder for a not-emitted expression in
     * order to preserve comments or sourcemap positions.
     *
     * @param expression The inner expression to emit.
     * @param original The original outer expression.
     * @param location The location for the expression. Defaults to the positions from "original" if provided.
     */
    function createPartiallyEmittedExpression(expression: Expression, original?: Node): PartiallyEmittedExpression;
    function updatePartiallyEmittedExpression(node: PartiallyEmittedExpression, expression: Expression): PartiallyEmittedExpression;
    function createCommaList(elements: ReadonlyArray<Expression>): CommaListExpression;
    function updateCommaList(node: CommaListExpression, elements: ReadonlyArray<Expression>): CommaListExpression;
    function createBundle(sourceFiles: ReadonlyArray<SourceFile>, prepends?: ReadonlyArray<UnparsedSource | InputFiles>): Bundle;
    function createUnparsedSourceFile(text: string): UnparsedSource;
    function createUnparsedSourceFile(text: string, mapPath: string | undefined, map: string | undefined): UnparsedSource;
    function createInputFiles(javascript: string, declaration: string): InputFiles;
    function createInputFiles(javascript: string, declaration: string, javascriptMapPath: string | undefined, javascriptMapText: string | undefined, declarationMapPath: string | undefined, declarationMapText: string | undefined): InputFiles;
    function updateBundle(node: Bundle, sourceFiles: ReadonlyArray<SourceFile>, prepends?: ReadonlyArray<UnparsedSource>): Bundle;
    function createImmediatelyInvokedFunctionExpression(statements: ReadonlyArray<Statement>): CallExpression;
    function createImmediatelyInvokedFunctionExpression(statements: ReadonlyArray<Statement>, param: ParameterDeclaration, paramValue: Expression): CallExpression;
    function createImmediatelyInvokedArrowFunction(statements: ReadonlyArray<Statement>): CallExpression;
    function createImmediatelyInvokedArrowFunction(statements: ReadonlyArray<Statement>, param: ParameterDeclaration, paramValue: Expression): CallExpression;
    function createComma(left: Expression, right: Expression): Expression;
    function createLessThan(left: Expression, right: Expression): Expression;
    function createAssignment(left: ObjectLiteralExpression | ArrayLiteralExpression, right: Expression): DestructuringAssignment;
    function createAssignment(left: Expression, right: Expression): BinaryExpression;
    function createStrictEquality(left: Expression, right: Expression): BinaryExpression;
    function createStrictInequality(left: Expression, right: Expression): BinaryExpression;
    function createAdd(left: Expression, right: Expression): BinaryExpression;
    function createSubtract(left: Expression, right: Expression): BinaryExpression;
    function createPostfixIncrement(operand: Expression): PostfixUnaryExpression;
    function createLogicalAnd(left: Expression, right: Expression): BinaryExpression;
    function createLogicalOr(left: Expression, right: Expression): BinaryExpression;
    function createLogicalNot(operand: Expression): PrefixUnaryExpression;
    function createVoidZero(): VoidExpression;
    function createExportDefault(expression: Expression): ExportAssignment;
    function createExternalModuleExport(exportName: Identifier): ExportDeclaration;
    /**
     * Clears any EmitNode entries from parse-tree nodes.
     * @param sourceFile A source file.
     */
    function disposeEmitNodes(sourceFile: SourceFile): void;
    function setTextRange<T extends TextRange>(range: T, location: TextRange | undefined): T;
    /**
     * Sets flags that control emit behavior of a node.
     */
    function setEmitFlags<T extends Node>(node: T, emitFlags: EmitFlags): T;
    /**
     * Gets a custom text range to use when emitting source maps.
     */
    function getSourceMapRange(node: Node): SourceMapRange;
    /**
     * Sets a custom text range to use when emitting source maps.
     */
    function setSourceMapRange<T extends Node>(node: T, range: SourceMapRange | undefined): T;
    /**
     * Create an external source map source file reference
     */
    function createSourceMapSource(fileName: string, text: string, skipTrivia?: (pos: number) => number): SourceMapSource;
    /**
     * Gets the TextRange to use for source maps for a token of a node.
     */
    function getTokenSourceMapRange(node: Node, token: SyntaxKind): SourceMapRange | undefined;
    /**
     * Sets the TextRange to use for source maps for a token of a node.
     */
    function setTokenSourceMapRange<T extends Node>(node: T, token: SyntaxKind, range: SourceMapRange | undefined): T;
    /**
     * Gets a custom text range to use when emitting comments.
     */
    function getCommentRange(node: Node): TextRange;
    /**
     * Sets a custom text range to use when emitting comments.
     */
    function setCommentRange<T extends Node>(node: T, range: TextRange): T;
    function getSyntheticLeadingComments(node: Node): SynthesizedComment[] | undefined;
    function setSyntheticLeadingComments<T extends Node>(node: T, comments: SynthesizedComment[] | undefined): T;
    function addSyntheticLeadingComment<T extends Node>(node: T, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean): T;
    function getSyntheticTrailingComments(node: Node): SynthesizedComment[] | undefined;
    function setSyntheticTrailingComments<T extends Node>(node: T, comments: SynthesizedComment[] | undefined): T;
    function addSyntheticTrailingComment<T extends Node>(node: T, kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia, text: string, hasTrailingNewLine?: boolean): T;
    function moveSyntheticComments<T extends Node>(node: T, original: Node): T;
    /**
     * Gets the constant value to emit for an expression.
     */
    function getConstantValue(node: PropertyAccessExpression | ElementAccessExpression): string | number | undefined;
    /**
     * Sets the constant value to emit for an expression.
     */
    function setConstantValue(node: PropertyAccessExpression | ElementAccessExpression, value: string | number): PropertyAccessExpression | ElementAccessExpression;
    /**
     * Adds an EmitHelper to a node.
     */
    function addEmitHelper<T extends Node>(node: T, helper: EmitHelper): T;
    /**
     * Add EmitHelpers to a node.
     */
    function addEmitHelpers<T extends Node>(node: T, helpers: EmitHelper[] | undefined): T;
    /**
     * Removes an EmitHelper from a node.
     */
    function removeEmitHelper(node: Node, helper: EmitHelper): boolean;
    /**
     * Gets the EmitHelpers of a node.
     */
    function getEmitHelpers(node: Node): EmitHelper[] | undefined;
    /**
     * Moves matching emit helpers from a source node to a target node.
     */
    function moveEmitHelpers(source: Node, target: Node, predicate: (helper: EmitHelper) => boolean): void;
    function setOriginalNode<T extends Node>(node: T, original: Node | undefined): T;
}
declare namespace ts {
    /**
     * Visits a Node using the supplied visitor, possibly returning a new Node in its place.
     *
     * @param node The Node to visit.
     * @param visitor The callback used to visit the Node.
     * @param test A callback to execute to verify the Node is valid.
     * @param lift An optional callback to execute to lift a NodeArray into a valid Node.
     */
    function visitNode<T extends Node>(node: T | undefined, visitor: Visitor | undefined, test?: (node: Node) => boolean, lift?: (node: NodeArray<Node>) => T): T;
    /**
     * Visits a Node using the supplied visitor, possibly returning a new Node in its place.
     *
     * @param node The Node to visit.
     * @param visitor The callback used to visit the Node.
     * @param test A callback to execute to verify the Node is valid.
     * @param lift An optional callback to execute to lift a NodeArray into a valid Node.
     */
    function visitNode<T extends Node>(node: T | undefined, visitor: Visitor | undefined, test?: (node: Node) => boolean, lift?: (node: NodeArray<Node>) => T): T | undefined;
    /**
     * Visits a NodeArray using the supplied visitor, possibly returning a new NodeArray in its place.
     *
     * @param nodes The NodeArray to visit.
     * @param visitor The callback used to visit a Node.
     * @param test A node test to execute for each node.
     * @param start An optional value indicating the starting offset at which to start visiting.
     * @param count An optional value indicating the maximum number of nodes to visit.
     */
    function visitNodes<T extends Node>(nodes: NodeArray<T> | undefined, visitor: Visitor, test?: (node: Node) => boolean, start?: number, count?: number): NodeArray<T>;
    /**
     * Visits a NodeArray using the supplied visitor, possibly returning a new NodeArray in its place.
     *
     * @param nodes The NodeArray to visit.
     * @param visitor The callback used to visit a Node.
     * @param test A node test to execute for each node.
     * @param start An optional value indicating the starting offset at which to start visiting.
     * @param count An optional value indicating the maximum number of nodes to visit.
     */
    function visitNodes<T extends Node>(nodes: NodeArray<T> | undefined, visitor: Visitor, test?: (node: Node) => boolean, start?: number, count?: number): NodeArray<T> | undefined;
    /**
     * Starts a new lexical environment and visits a statement list, ending the lexical environment
     * and merging hoisted declarations upon completion.
     */
    function visitLexicalEnvironment(statements: NodeArray<Statement>, visitor: Visitor, context: TransformationContext, start?: number, ensureUseStrict?: boolean): NodeArray<Statement>;
    /**
     * Starts a new lexical environment and visits a parameter list, suspending the lexical
     * environment upon completion.
     */
    function visitParameterList(nodes: NodeArray<ParameterDeclaration> | undefined, visitor: Visitor, context: TransformationContext, nodesVisitor?: typeof visitNodes): NodeArray<ParameterDeclaration>;
    /**
     * Resumes a suspended lexical environment and visits a function body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    function visitFunctionBody(node: FunctionBody, visitor: Visitor, context: TransformationContext): FunctionBody;
    /**
     * Resumes a suspended lexical environment and visits a function body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    function visitFunctionBody(node: FunctionBody | undefined, visitor: Visitor, context: TransformationContext): FunctionBody | undefined;
    /**
     * Resumes a suspended lexical environment and visits a concise body, ending the lexical
     * environment and merging hoisted declarations upon completion.
     */
    function visitFunctionBody(node: ConciseBody, visitor: Visitor, context: TransformationContext): ConciseBody;
    /**
     * Visits each child of a Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
     *
     * @param node The Node whose children will be visited.
     * @param visitor The callback used to visit each child.
     * @param context A lexical environment context for the visitor.
     */
    function visitEachChild<T extends Node>(node: T, visitor: Visitor, context: TransformationContext): T;
    /**
     * Visits each child of a Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
     *
     * @param node The Node whose children will be visited.
     * @param visitor The callback used to visit each child.
     * @param context A lexical environment context for the visitor.
     */
    function visitEachChild<T extends Node>(node: T | undefined, visitor: Visitor, context: TransformationContext, nodesVisitor?: typeof visitNodes, tokenVisitor?: Visitor): T | undefined;
}
declare namespace ts {
<<<<<<< HEAD
=======
    /**
     * Similar to `reduceLeft`, performs a reduction against each child of a node.
     * NOTE: Unlike `forEachChild`, this does *not* visit every node.
     *
     * @param node The node containing the children to reduce.
     * @param initial The initial value to supply to the reduction.
     * @param f The callback function
     */
    function reduceEachChild<T>(node: Node | undefined, initial: T, cbNode: (memo: T, node: Node) => T, cbNodeArray?: (memo: T, nodes: NodeArray<Node>) => T): T;
    /**
     * Merges generated lexical declarations into a new statement list.
     */
    function mergeLexicalEnvironment(statements: NodeArray<Statement>, declarations: ReadonlyArray<Statement> | undefined): NodeArray<Statement>;
    /**
     * Appends generated lexical declarations to an array of statements.
     */
    function mergeLexicalEnvironment(statements: Statement[], declarations: ReadonlyArray<Statement> | undefined): Statement[];
    /**
     * Lifts a NodeArray containing only Statement nodes to a block.
     *
     * @param nodes The NodeArray.
     */
    function liftToBlock(nodes: ReadonlyArray<Node>): Statement;
    /**
     * Aggregates the TransformFlags for a Node and its subtree.
     */
    function aggregateTransformFlags<T extends Node>(node: T): T;
    namespace Debug {
        function failBadSyntaxKind(node: Node, message?: string): never;
        const assertEachNode: (nodes: Node[], test: (node: Node) => boolean, message?: string | undefined) => void;
        const assertNode: (node: Node | undefined, test: ((node: Node | undefined) => boolean) | undefined, message?: string | undefined) => void;
        const assertOptionalNode: (node: Node, test: (node: Node) => boolean, message?: string | undefined) => void;
        const assertOptionalToken: (node: Node, kind: SyntaxKind, message?: string | undefined) => void;
        const assertMissingNode: typeof noop;
        /**
         * Injects debug information into frequently used types.
         */
        function enableDebugInfo(): void;
    }
}
declare namespace ts {
    interface SourceFileLikeCache {
        get(path: Path): SourceFileLike | undefined;
    }
    function createSourceFileLikeCache(host: {
        readFile?: (path: string) => string | undefined;
        fileExists?: (path: string) => boolean;
    }): SourceFileLikeCache;
}
declare namespace ts.sourcemaps {
    interface SourceMapData {
        version?: number;
        file?: string;
        sourceRoot?: string;
        sources: string[];
        sourcesContent?: (string | null)[];
        names?: string[];
        mappings: string;
    }
    interface SourceMappableLocation {
        fileName: string;
        position: number;
    }
    interface SourceMapper {
        getOriginalPosition(input: SourceMappableLocation): SourceMappableLocation;
        getGeneratedPosition(input: SourceMappableLocation): SourceMappableLocation;
    }
    const identitySourceMapper: {
        getOriginalPosition: typeof identity;
        getGeneratedPosition: typeof identity;
    };
    interface SourceMapDecodeHost {
        readFile(path: string): string | undefined;
        fileExists(path: string): boolean;
        getCanonicalFileName(path: string): string;
        log(text: string): void;
    }
    function decode(host: SourceMapDecodeHost, mapPath: string, map: SourceMapData, program?: Program, fallbackCache?: SourceFileLikeCache): SourceMapper;
    function calculateDecodedMappings<T>(map: SourceMapData, processPosition: (position: RawSourceMapPosition) => T, host?: {
        log?(s: string): void;
    }): T[];
    interface RawSourceMapPosition {
        emittedLine: number;
        emittedColumn: number;
        sourceLine: number;
        sourceColumn: number;
        sourceIndex: number;
        nameIndex?: number;
    }
}
declare namespace ts {
    function getOriginalNodeId(node: Node): number;
    interface ExternalModuleInfo {
        externalImports: (ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration)[];
        externalHelpersImportDeclaration: ImportDeclaration | undefined;
        exportSpecifiers: Map<ExportSpecifier[]>;
        exportedBindings: Identifier[][];
        exportedNames: Identifier[] | undefined;
        exportEquals: ExportAssignment | undefined;
        hasExportStarsToExportValues: boolean;
    }
    function chainBundle(transformSourceFile: (x: SourceFile) => SourceFile): (x: SourceFile | Bundle) => SourceFile | Bundle;
    function getImportNeedsImportStarHelper(node: ImportDeclaration): boolean;
    function getImportNeedsImportDefaultHelper(node: ImportDeclaration): boolean;
    function collectExternalModuleInfo(sourceFile: SourceFile, resolver: EmitResolver, compilerOptions: CompilerOptions): ExternalModuleInfo;
    /**
     * Used in the module transformer to check if an expression is reasonably without sideeffect,
     *  and thus better to copy into multiple places rather than to cache in a temporary variable
     *  - this is mostly subjective beyond the requirement that the expression not be sideeffecting
     */
    function isSimpleCopiableExpression(expression: Expression): boolean;
    /**
     * @param input Template string input strings
     * @param args Names which need to be made file-level unique
     */
    function helperString(input: TemplateStringsArray, ...args: string[]): (uniqueName: EmitHelperUniqueNameCallback) => string;
}
declare namespace ts {
    enum FlattenLevel {
        All = 0,
        ObjectRest = 1
    }
    /**
     * Flattens a DestructuringAssignment or a VariableDeclaration to an expression.
     *
     * @param node The node to flatten.
     * @param visitor An optional visitor used to visit initializers.
     * @param context The transformation context.
     * @param level Indicates the extent to which flattening should occur.
     * @param needsValue An optional value indicating whether the value from the right-hand-side of
     * the destructuring assignment is needed as part of a larger expression.
     * @param createAssignmentCallback An optional callback used to create the assignment expression.
     */
    function flattenDestructuringAssignment(node: VariableDeclaration | DestructuringAssignment, visitor: ((node: Node) => VisitResult<Node>) | undefined, context: TransformationContext, level: FlattenLevel, needsValue?: boolean, createAssignmentCallback?: (name: Identifier, value: Expression, location?: TextRange) => Expression): Expression;
    /**
     * Flattens a VariableDeclaration or ParameterDeclaration to one or more variable declarations.
     *
     * @param node The node to flatten.
     * @param visitor An optional visitor used to visit initializers.
     * @param context The transformation context.
     * @param boundValue The value bound to the declaration.
     * @param skipInitializer A value indicating whether to ignore the initializer of `node`.
     * @param hoistTempVariables Indicates whether temporary variables should not be recorded in-line.
     * @param level Indicates the extent to which flattening should occur.
     */
    function flattenDestructuringBinding(node: VariableDeclaration | ParameterDeclaration, visitor: (node: Node) => VisitResult<Node>, context: TransformationContext, level: FlattenLevel, rval?: Expression, hoistTempVariables?: boolean, skipInitializer?: boolean): VariableDeclaration[];
}
declare namespace ts {
    function transformTypeScript(context: TransformationContext): (node: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformES2017(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
    const asyncSuperHelper: EmitHelper;
    const advancedAsyncSuperHelper: EmitHelper;
}
declare namespace ts {
    function transformESNext(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
    function createAssignHelper(context: TransformationContext, attributesSegments: Expression[]): CallExpression;
}
declare namespace ts {
    function transformJsx(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformES2016(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformES2015(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    /**
     * Transforms ES5 syntax into ES3 syntax.
     *
     * @param context Context and state information for the transformation.
     */
    function transformES5(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformGenerators(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformModule(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformSystemModule(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    function transformES2015Module(context: TransformationContext): (x: SourceFile | Bundle) => SourceFile | Bundle;
}
declare namespace ts {
    type GetSymbolAccessibilityDiagnostic = (symbolAccessibilityResult: SymbolAccessibilityResult) => (SymbolAccessibilityDiagnostic | undefined);
    interface SymbolAccessibilityDiagnostic {
        errorNode: Node;
        diagnosticMessage: DiagnosticMessage;
        typeName?: DeclarationName | QualifiedName;
    }
    type DeclarationDiagnosticProducing = VariableDeclaration | PropertyDeclaration | PropertySignature | BindingElement | SetAccessorDeclaration | GetAccessorDeclaration | ConstructSignatureDeclaration | CallSignatureDeclaration | MethodDeclaration | MethodSignature | FunctionDeclaration | ParameterDeclaration | TypeParameterDeclaration | ExpressionWithTypeArguments | ImportEqualsDeclaration | TypeAliasDeclaration | ConstructorDeclaration | IndexSignatureDeclaration;
    function canProduceDiagnostics(node: Node): node is DeclarationDiagnosticProducing;
    function createGetSymbolAccessibilityDiagnosticForNodeName(node: DeclarationDiagnosticProducing): (symbolAccessibilityResult: SymbolAccessibilityResult) => SymbolAccessibilityDiagnostic | undefined;
    function createGetSymbolAccessibilityDiagnosticForNode(node: DeclarationDiagnosticProducing): (symbolAccessibilityResult: SymbolAccessibilityResult) => SymbolAccessibilityDiagnostic | undefined;
}
declare namespace ts {
    function getDeclarationDiagnostics(host: EmitHost, resolver: EmitResolver, file: SourceFile | undefined): DiagnosticWithLocation[] | undefined;
    /**
     * Transforms a ts file into a .d.ts file
     * This process requires type information, which is retrieved through the emit resolver. Because of this,
     * in many places this transformer assumes it will be operating on parse tree nodes directly.
     * This means that _no transforms should be allowed to occur before this one_.
     */
    function transformDeclarations(context: TransformationContext): {
        (node: Bundle): Bundle;
        (node: SourceFile): SourceFile;
        (node: SourceFile | Bundle): SourceFile | Bundle;
    };
}
declare namespace ts {
    function getTransformers(compilerOptions: CompilerOptions, customTransformers?: CustomTransformers): TransformerFactory<SourceFile | Bundle>[];
    /**
     * Transforms an array of SourceFiles by passing them through each transformer.
     *
     * @param resolver The emit resolver provided by the checker.
     * @param host The emit host object used to interact with the file system.
     * @param options Compiler options to surface in the `TransformationContext`.
     * @param nodes An array of nodes to transform.
     * @param transforms An array of `TransformerFactory` callbacks.
     * @param allowDtsFiles A value indicating whether to allow the transformation of .d.ts files.
     */
    function transformNodes<T extends Node>(resolver: EmitResolver | undefined, host: EmitHost | undefined, options: CompilerOptions, nodes: ReadonlyArray<T>, transformers: ReadonlyArray<TransformerFactory<T>>, allowDtsFiles: boolean): TransformationResult<T>;
}
declare namespace ts {
    interface SourceMapWriter {
        /**
         * Initialize the SourceMapWriter for a new output file.
         *
         * @param filePath The path to the generated output file.
         * @param sourceMapFilePath The path to the output source map file.
         * @param sourceFileOrBundle The input source file or bundle for the program.
         */
        initialize(filePath: string, sourceMapFilePath: string | undefined, sourceFileOrBundle: SourceFile | Bundle, sourceMapOutput?: SourceMapData[]): void;
        /**
         * Reset the SourceMapWriter to an empty state.
         */
        reset(): void;
        /**
         * Set the current source file.
         *
         * @param sourceFile The source file.
         */
        setSourceFile(sourceFile: SourceMapSource): void;
        /**
         * Emits a mapping.
         *
         * If the position is synthetic (undefined or a negative value), no mapping will be
         * created.
         *
         * @param pos The position.
         */
        emitPos(pos: number): void;
        /**
         * Emits a node with possible leading and trailing source maps.
         *
         * @param hint The current emit context
         * @param node The node to emit.
         * @param emitCallback The callback used to emit the node.
         */
        emitNodeWithSourceMap(hint: EmitHint, node: Node, emitCallback: (hint: EmitHint, node: Node) => void): void;
        /**
         * Emits a token of a node node with possible leading and trailing source maps.
         *
         * @param node The node containing the token.
         * @param token The token to emit.
         * @param tokenStartPos The start pos of the token.
         * @param emitCallback The callback used to emit the token.
         */
        emitTokenWithSourceMap(node: Node, token: SyntaxKind, writer: (s: string) => void, tokenStartPos: number, emitCallback: (token: SyntaxKind, writer: (s: string) => void, tokenStartPos: number) => number): number;
        /**
         * Gets the text for the source map.
         */
        getText(): string;
        /**
         * Gets the SourceMappingURL for the source map.
         */
        getSourceMappingURL(): string;
    }
    interface SourceMapOptions {
        sourceMap?: boolean;
        inlineSourceMap?: boolean;
        inlineSources?: boolean;
        sourceRoot?: string;
        mapRoot?: string;
        extendedDiagnostics?: boolean;
    }
    function createSourceMapWriter(host: EmitHost, writer: EmitTextWriter, compilerOptions?: SourceMapOptions): SourceMapWriter;
}
declare namespace ts {
    interface CommentWriter {
        reset(): void;
        setSourceFile(sourceFile: SourceFile): void;
        setWriter(writer: EmitTextWriter | undefined): void;
        emitNodeWithComments(hint: EmitHint, node: Node | undefined, emitCallback: (hint: EmitHint, node: Node) => void): void;
        emitBodyWithDetachedComments(node: Node, detachedRange: TextRange, emitCallback: (node: Node) => void): void;
        emitTrailingCommentsOfPosition(pos: number, prefixSpace?: boolean): void;
        emitLeadingCommentsOfPosition(pos: number): void;
    }
    function createCommentWriter(printerOptions: PrinterOptions, emitPos: ((pos: number) => void) | undefined): CommentWriter;
}
declare namespace ts {
    /**
     * Iterates over the source files that are expected to have an emit output.
     *
     * @param host An EmitHost.
     * @param action The action to execute.
     * @param sourceFilesOrTargetSourceFile
     *   If an array, the full list of source files to emit.
     *   Else, calls `getSourceFilesToEmit` with the (optional) target source file to determine the list of source files to emit.
     */
    function forEachEmittedFile<T>(host: EmitHost, action: (emitFileNames: EmitFileNames, sourceFileOrBundle: SourceFile | Bundle) => T, sourceFilesOrTargetSourceFile?: ReadonlyArray<SourceFile> | SourceFile, emitOnlyDtsFiles?: boolean): T | undefined;
    function getOutputPathsFor(sourceFile: SourceFile | Bundle, host: EmitHost, forceDtsPaths: boolean): EmitFileNames;
    function getOutputExtension(sourceFile: SourceFile, options: CompilerOptions): Extension;
    function emitFiles(resolver: EmitResolver, host: EmitHost, targetSourceFile: SourceFile, emitOnlyDtsFiles?: boolean, transformers?: TransformerFactory<Bundle | SourceFile>[], declarationTransformers?: TransformerFactory<Bundle | SourceFile>[]): EmitResult;
>>>>>>> a56b272d3891916a8debe36087fe7563bbade164
    function createPrinter(printerOptions?: PrinterOptions, handlers?: PrintHandlers): Printer;
}
declare namespace ts {
    function findConfigFile(searchPath: string, fileExists: (fileName: string) => boolean, configName?: string): string | undefined;
    function resolveTripleslashReference(moduleName: string, containingFile: string): string;
    function createCompilerHost(options: CompilerOptions, setParentNodes?: boolean): CompilerHost;
    function getPreEmitDiagnostics(program: Program, sourceFile?: SourceFile, cancellationToken?: CancellationToken): Diagnostic[];
    interface FormatDiagnosticsHost {
        getCurrentDirectory(): string;
        getCanonicalFileName(fileName: string): string;
        getNewLine(): string;
    }
    function formatDiagnostics(diagnostics: ReadonlyArray<Diagnostic>, host: FormatDiagnosticsHost): string;
    function formatDiagnostic(diagnostic: Diagnostic, host: FormatDiagnosticsHost): string;
    function formatDiagnosticsWithColorAndContext(diagnostics: ReadonlyArray<Diagnostic>, host: FormatDiagnosticsHost): string;
    function flattenDiagnosticMessageText(messageText: string | DiagnosticMessageChain | undefined, newLine: string): string;
    function getConfigFileParsingDiagnostics(configFileParseResult: ParsedCommandLine): ReadonlyArray<Diagnostic>;
    /**
     * Create a new 'Program' instance. A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions'
     * that represent a compilation unit.
     *
     * Creating a program proceeds from a set of root files, expanding the set of inputs by following imports and
     * triple-slash-reference-path directives transitively. '@types' and triple-slash-reference-types are also pulled in.
     *
     * @param createProgramOptions - The options for creating a program.
     * @returns A 'Program' object.
     */
    function createProgram(createProgramOptions: CreateProgramOptions): Program;
    /**
     * Create a new 'Program' instance. A Program is an immutable collection of 'SourceFile's and a 'CompilerOptions'
     * that represent a compilation unit.
     *
     * Creating a program proceeds from a set of root files, expanding the set of inputs by following imports and
     * triple-slash-reference-path directives transitively. '@types' and triple-slash-reference-types are also pulled in.
     *
     * @param rootNames - A set of root files.
     * @param options - The compiler options which should be used.
     * @param host - The host interacts with the underlying file system.
     * @param oldProgram - Reuses an old program structure.
     * @param configFileParsingDiagnostics - error during config file parsing
     * @returns A 'Program' object.
     */
    function createProgram(rootNames: ReadonlyArray<string>, options: CompilerOptions, host?: CompilerHost, oldProgram?: Program, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): Program;
    /**
     * Returns the target config filename of a project reference
     */
    function resolveProjectReferencePath(host: CompilerHost, ref: ProjectReference): string | undefined;
}
declare namespace ts {
    interface EmitOutput {
        outputFiles: OutputFile[];
        emitSkipped: boolean;
    }
    interface OutputFile {
        name: string;
        writeByteOrderMark: boolean;
        text: string;
    }
}
declare namespace ts {
    type AffectedFileResult<T> = {
        result: T;
        affected: SourceFile | Program;
    } | undefined;
    interface BuilderProgramHost {
        /**
         * return true if file names are treated with case sensitivity
         */
        useCaseSensitiveFileNames(): boolean;
        /**
         * If provided this would be used this hash instead of actual file shape text for detecting changes
         */
        createHash?: (data: string) => string;
        /**
         * When emit or emitNextAffectedFile are called without writeFile,
         * this callback if present would be used to write files
         */
        writeFile?: WriteFileCallback;
    }
    /**
     * Builder to manage the program state changes
     */
    interface BuilderProgram {
        /**
         * Returns current program
         */
        getProgram(): Program;
        /**
         * Get compiler options of the program
         */
        getCompilerOptions(): CompilerOptions;
        /**
         * Get the source file in the program with file name
         */
        getSourceFile(fileName: string): SourceFile | undefined;
        /**
         * Get a list of files in the program
         */
        getSourceFiles(): ReadonlyArray<SourceFile>;
        /**
         * Get the diagnostics for compiler options
         */
        getOptionsDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        /**
         * Get the diagnostics that dont belong to any file
         */
        getGlobalDiagnostics(cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        /**
         * Get the diagnostics from config file parsing
         */
        getConfigFileParsingDiagnostics(): ReadonlyArray<Diagnostic>;
        /**
         * Get the syntax diagnostics, for all source files if source file is not supplied
         */
        getSyntacticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        /**
         * Get all the dependencies of the file
         */
        getAllDependencies(sourceFile: SourceFile): ReadonlyArray<string>;
        /**
         * Gets the semantic diagnostics from the program corresponding to this state of file (if provided) or whole program
         * The semantic diagnostics are cached and managed here
         * Note that it is assumed that when asked about semantic diagnostics through this API,
         * the file has been taken out of affected files so it is safe to use cache or get from program and cache the diagnostics
         * In case of SemanticDiagnosticsBuilderProgram if the source file is not provided,
         * it will iterate through all the affected files, to ensure that cache stays valid and yet provide a way to get all semantic diagnostics
         */
        getSemanticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): ReadonlyArray<Diagnostic>;
        /**
         * Emits the JavaScript and declaration files.
         * When targetSource file is specified, emits the files corresponding to that source file,
         * otherwise for the whole program.
         * In case of EmitAndSemanticDiagnosticsBuilderProgram, when targetSourceFile is specified,
         * it is assumed that that file is handled from affected file list. If targetSourceFile is not specified,
         * it will only emit all the affected files instead of whole program
         *
         * The first of writeFile if provided, writeFile of BuilderProgramHost if provided, writeFile of compiler host
         * in that order would be used to write the files
         */
        emit(targetSourceFile?: SourceFile, writeFile?: WriteFileCallback, cancellationToken?: CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: CustomTransformers): EmitResult;
        /**
         * Get the current directory of the program
         */
        getCurrentDirectory(): string;
    }
    /**
     * The builder that caches the semantic diagnostics for the program and handles the changed files and affected files
     */
    interface SemanticDiagnosticsBuilderProgram extends BuilderProgram {
        /**
         * Gets the semantic diagnostics from the program for the next affected file and caches it
         * Returns undefined if the iteration is complete
         */
        getSemanticDiagnosticsOfNextAffectedFile(cancellationToken?: CancellationToken, ignoreSourceFile?: (sourceFile: SourceFile) => boolean): AffectedFileResult<ReadonlyArray<Diagnostic>>;
    }
    /**
     * The builder that can handle the changes in program and iterate through changed file to emit the files
     * The semantic diagnostics are cached per file and managed by clearing for the changed/affected files
     */
    interface EmitAndSemanticDiagnosticsBuilderProgram extends BuilderProgram {
        /**
         * Emits the next affected file's emit result (EmitResult and sourceFiles emitted) or returns undefined if iteration is complete
         * The first of writeFile if provided, writeFile of BuilderProgramHost if provided, writeFile of compiler host
         * in that order would be used to write the files
         */
        emitNextAffectedFile(writeFile?: WriteFileCallback, cancellationToken?: CancellationToken, emitOnlyDtsFiles?: boolean, customTransformers?: CustomTransformers): AffectedFileResult<EmitResult>;
    }
    /**
     * Create the builder to manage semantic diagnostics and cache them
     */
    function createSemanticDiagnosticsBuilderProgram(newProgram: Program, host: BuilderProgramHost, oldProgram?: SemanticDiagnosticsBuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): SemanticDiagnosticsBuilderProgram;
    function createSemanticDiagnosticsBuilderProgram(rootNames: ReadonlyArray<string> | undefined, options: CompilerOptions | undefined, host?: CompilerHost, oldProgram?: SemanticDiagnosticsBuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): SemanticDiagnosticsBuilderProgram;
    /**
     * Create the builder that can handle the changes in program and iterate through changed files
     * to emit the those files and manage semantic diagnostics cache as well
     */
    function createEmitAndSemanticDiagnosticsBuilderProgram(newProgram: Program, host: BuilderProgramHost, oldProgram?: EmitAndSemanticDiagnosticsBuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): EmitAndSemanticDiagnosticsBuilderProgram;
    function createEmitAndSemanticDiagnosticsBuilderProgram(rootNames: ReadonlyArray<string> | undefined, options: CompilerOptions | undefined, host?: CompilerHost, oldProgram?: EmitAndSemanticDiagnosticsBuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): EmitAndSemanticDiagnosticsBuilderProgram;
    /**
     * Creates a builder thats just abstraction over program and can be used with watch
     */
    function createAbstractBuilder(newProgram: Program, host: BuilderProgramHost, oldProgram?: BuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): BuilderProgram;
    function createAbstractBuilder(rootNames: ReadonlyArray<string> | undefined, options: CompilerOptions | undefined, host?: CompilerHost, oldProgram?: BuilderProgram, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>): BuilderProgram;
}
declare namespace ts {
    type WatchStatusReporter = (diagnostic: Diagnostic, newLine: string, options: CompilerOptions) => void;
    /** Create the program with rootNames and options, if they are undefined, oldProgram and new configFile diagnostics create new program */
    type CreateProgram<T extends BuilderProgram> = (rootNames: ReadonlyArray<string> | undefined, options: CompilerOptions | undefined, host?: CompilerHost, oldProgram?: T, configFileParsingDiagnostics?: ReadonlyArray<Diagnostic>) => T;
    interface WatchCompilerHost<T extends BuilderProgram> {
        /**
         * Used to create the program when need for program creation or recreation detected
         */
        createProgram: CreateProgram<T>;
        /** If provided, callback to invoke after every new program creation */
        afterProgramCreate?(program: T): void;
        /** If provided, called with Diagnostic message that informs about change in watch status */
        onWatchStatusChange?(diagnostic: Diagnostic, newLine: string, options: CompilerOptions): void;
        useCaseSensitiveFileNames(): boolean;
        getNewLine(): string;
        getCurrentDirectory(): string;
        getDefaultLibFileName(options: CompilerOptions): string;
        getDefaultLibLocation?(): string;
        createHash?(data: string): string;
        /**
         * Use to check file presence for source files and
         * if resolveModuleNames is not provided (complier is in charge of module resolution) then module files as well
         */
        fileExists(path: string): boolean;
        /**
         * Use to read file text for source files and
         * if resolveModuleNames is not provided (complier is in charge of module resolution) then module files as well
         */
        readFile(path: string, encoding?: string): string | undefined;
        /** If provided, used for module resolution as well as to handle directory structure */
        directoryExists?(path: string): boolean;
        /** If provided, used in resolutions as well as handling directory structure */
        getDirectories?(path: string): string[];
        /** If provided, used to cache and handle directory structure modifications */
        readDirectory?(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
        /** Symbol links resolution */
        realpath?(path: string): string;
        /** If provided would be used to write log about compilation */
        trace?(s: string): void;
        /** If provided is used to get the environment variable */
        getEnvironmentVariable?(name: string): string | undefined;
        /** If provided, used to resolve the module names, otherwise typescript's default module resolution */
        resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames?: string[]): ResolvedModule[];
        /** If provided, used to resolve type reference directives, otherwise typescript's default resolution */
        resolveTypeReferenceDirectives?(typeReferenceDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        /** Used to watch changes in source files, missing files needed to update the program or config file */
        watchFile(path: string, callback: FileWatcherCallback, pollingInterval?: number): FileWatcher;
        /** Used to watch resolved module's failed lookup locations, config file specs, type roots where auto type reference directives are added */
        watchDirectory(path: string, callback: DirectoryWatcherCallback, recursive?: boolean): FileWatcher;
        /** If provided, will be used to set delayed compilation, so that multiple changes in short span are compiled together */
        setTimeout?(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
        /** If provided, will be used to reset existing delayed compilation */
        clearTimeout?(timeoutId: any): void;
    }
    /**
     * Host to create watch with root files and options
     */
    interface WatchCompilerHostOfFilesAndCompilerOptions<T extends BuilderProgram> extends WatchCompilerHost<T> {
        /** root files to use to generate program */
        rootFiles: string[];
        /** Compiler options */
        options: CompilerOptions;
    }
    /**
     * Host to create watch with config file
     */
    interface WatchCompilerHostOfConfigFile<T extends BuilderProgram> extends WatchCompilerHost<T>, ConfigFileDiagnosticsReporter {
        /** Name of the config file to compile */
        configFileName: string;
        /** Options to extend */
        optionsToExtend?: CompilerOptions;
        /**
         * Used to generate source file names from the config file and its include, exclude, files rules
         * and also to cache the directory stucture
         */
        readDirectory(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
    }
    interface Watch<T> {
        /** Synchronize with host and get updated program */
        getProgram(): T;
    }
    /**
     * Creates the watch what generates program using the config file
     */
    interface WatchOfConfigFile<T> extends Watch<T> {
    }
    /**
     * Creates the watch that generates program using the root files and compiler options
     */
    interface WatchOfFilesAndCompilerOptions<T> extends Watch<T> {
        /** Updates the root files in the program, only if this is not config file compilation */
        updateRootFileNames(fileNames: string[]): void;
    }
    /**
     * Create the watch compiler host for either configFile or fileNames and its options
     */
    function createWatchCompilerHost<T extends BuilderProgram>(rootFiles: string[], options: CompilerOptions, system: System, createProgram?: CreateProgram<T>, reportDiagnostic?: DiagnosticReporter, reportWatchStatus?: WatchStatusReporter): WatchCompilerHostOfFilesAndCompilerOptions<T>;
    function createWatchCompilerHost<T extends BuilderProgram>(configFileName: string, optionsToExtend: CompilerOptions | undefined, system: System, createProgram?: CreateProgram<T>, reportDiagnostic?: DiagnosticReporter, reportWatchStatus?: WatchStatusReporter): WatchCompilerHostOfConfigFile<T>;
    /**
     * Creates the watch from the host for root files and compiler options
     */
    function createWatchProgram<T extends BuilderProgram>(host: WatchCompilerHostOfFilesAndCompilerOptions<T>): WatchOfFilesAndCompilerOptions<T>;
    /**
     * Creates the watch from the host for config file
     */
    function createWatchProgram<T extends BuilderProgram>(host: WatchCompilerHostOfConfigFile<T>): WatchOfConfigFile<T>;
}
declare namespace ts {
    /**
     * Branded string for keeping track of when we've turned an ambiguous path
     * specified like "./blah" to an absolute path to an actual
     * tsconfig file, e.g. "/root/blah/tsconfig.json"
     */
    type ResolvedConfigFileName = string & {
        _isResolvedConfigFileName: never;
    };
    interface BuildHost {
        verbose(diag: DiagnosticMessage, ...args: string[]): void;
        error(diag: DiagnosticMessage, ...args: string[]): void;
        errorDiagnostic(diag: Diagnostic): void;
        message(diag: DiagnosticMessage, ...args: string[]): void;
    }
    /**
     * A BuildContext tracks what's going on during the course of a build.
     *
     * Callers may invoke any number of build requests within the same context;
     * until the context is reset, each project will only be built at most once.
     *
     * Example: In a standard setup where project B depends on project A, and both are out of date,
     * a failed build of A will result in A remaining out of date. When we try to build
     * B, we should immediately bail instead of recomputing A's up-to-date status again.
     *
     * This also matters for performing fast (i.e. fake) downstream builds of projects
     * when their upstream .d.ts files haven't changed content (but have newer timestamps)
     */
    interface BuildContext {
        options: BuildOptions;
        /**
         * Map from output file name to its pre-build timestamp
         */
        unchangedOutputs: FileMap<Date>;
        /**
         * Map from config file name to up-to-date status
         */
        projectStatus: FileMap<UpToDateStatus>;
        invalidatedProjects: FileMap<true>;
        queuedProjects: FileMap<true>;
        missingRoots: Map<true>;
    }
    type Mapper = ReturnType<typeof createDependencyMapper>;
    interface DependencyGraph {
        buildQueue: ResolvedConfigFileName[];
        dependencyMap: Mapper;
    }
    interface BuildOptions {
        dry: boolean;
        force: boolean;
        verbose: boolean;
    }
    enum UpToDateStatusType {
        Unbuildable = 0,
        UpToDate = 1,
        /**
         * The project appears out of date because its upstream inputs are newer than its outputs,
         * but all of its outputs are actually newer than the previous identical outputs of its (.d.ts) inputs.
         * This means we can Pseudo-build (just touch timestamps), as if we had actually built this project.
         */
        UpToDateWithUpstreamTypes = 2,
        OutputMissing = 3,
        OutOfDateWithSelf = 4,
        OutOfDateWithUpstream = 5,
        UpstreamOutOfDate = 6,
        UpstreamBlocked = 7,
        /**
         * Projects with no outputs (i.e. "solution" files)
         */
        ContainerOnly = 8
    }
    type UpToDateStatus = Status.Unbuildable | Status.UpToDate | Status.OutputMissing | Status.OutOfDateWithSelf | Status.OutOfDateWithUpstream | Status.UpstreamOutOfDate | Status.UpstreamBlocked | Status.ContainerOnly;
    namespace Status {
        /**
         * The project can't be built at all in its current state. For example,
         * its config file cannot be parsed, or it has a syntax error or missing file
         */
        interface Unbuildable {
            type: UpToDateStatusType.Unbuildable;
            reason: string;
        }
        /**
         * This project doesn't have any outputs, so "is it up to date" is a meaningless question.
         */
        interface ContainerOnly {
            type: UpToDateStatusType.ContainerOnly;
        }
        /**
         * The project is up to date with respect to its inputs.
         * We track what the newest input file is.
         */
        interface UpToDate {
            type: UpToDateStatusType.UpToDate | UpToDateStatusType.UpToDateWithUpstreamTypes;
            newestInputFileTime: Date;
            newestInputFileName: string;
            newestDeclarationFileContentChangedTime: Date;
            newestOutputFileTime: Date;
            newestOutputFileName: string;
            oldestOutputFileName: string;
        }
        /**
         * One or more of the outputs of the project does not exist.
         */
        interface OutputMissing {
            type: UpToDateStatusType.OutputMissing;
            /**
             * The name of the first output file that didn't exist
             */
            missingOutputFileName: string;
        }
        /**
         * One or more of the project's outputs is older than its newest input.
         */
        interface OutOfDateWithSelf {
            type: UpToDateStatusType.OutOfDateWithSelf;
            outOfDateOutputFileName: string;
            newerInputFileName: string;
        }
        /**
         * This project depends on an out-of-date project, so shouldn't be built yet
         */
        interface UpstreamOutOfDate {
            type: UpToDateStatusType.UpstreamOutOfDate;
            upstreamProjectName: string;
        }
        /**
         * This project depends an upstream project with build errors
         */
        interface UpstreamBlocked {
            type: UpToDateStatusType.UpstreamBlocked;
            upstreamProjectName: string;
        }
        /**
         * One or more of the project's outputs is older than the newest output of
         * an upstream project.
         */
        interface OutOfDateWithUpstream {
            type: UpToDateStatusType.OutOfDateWithUpstream;
            outOfDateOutputFileName: string;
            newerProjectName: string;
        }
    }
    interface FileMap<T> {
        setValue(fileName: string, value: T): void;
        getValue(fileName: string): T | never;
        getValueOrUndefined(fileName: string): T | undefined;
        hasKey(fileName: string): boolean;
        removeKey(fileName: string): void;
        getKeys(): string[];
    }
    function createDependencyMapper(): {
        addReference: (childConfigFileName: ResolvedConfigFileName, parentConfigFileName: ResolvedConfigFileName) => void;
        getReferencesTo: (parentConfigFileName: ResolvedConfigFileName) => ResolvedConfigFileName[];
        getReferencesOf: (childConfigFileName: ResolvedConfigFileName) => ResolvedConfigFileName[];
        getKeys: () => ReadonlyArray<ResolvedConfigFileName>;
    };
    function createBuildContext(options: BuildOptions): BuildContext;
    function performBuild(args: string[], compilerHost: CompilerHost, buildHost: BuildHost, system?: System): number | undefined;
    /**
     * A SolutionBuilder has an immutable set of rootNames that are the "entry point" projects, but
     * can dynamically add/remove other projects based on changes on the rootNames' references
     */
    function createSolutionBuilder(compilerHost: CompilerHost, buildHost: BuildHost, rootNames: ReadonlyArray<string>, defaultOptions: BuildOptions, system?: System): {
        buildAllProjects: () => number;
        getUpToDateStatus: (project: ParsedCommandLine | undefined) => UpToDateStatus;
        getUpToDateStatusOfFile: (configFileName: ResolvedConfigFileName) => UpToDateStatus;
        cleanAllProjects: () => ExitStatus.Success | ExitStatus.DiagnosticsPresent_OutputsSkipped;
        resetBuildContext: (opts?: BuildOptions) => void;
        getBuildGraph: (configFileNames: ReadonlyArray<string>) => DependencyGraph | undefined;
        invalidateProject: (configFileName: string) => void;
        buildInvalidatedProjects: () => void;
        buildDependentInvalidatedProjects: () => void;
        resolveProjectName: (name: string) => ResolvedConfigFileName | undefined;
        startWatching: () => void;
    };
}
declare namespace ts {
    interface Node {
        getSourceFile(): SourceFile;
        getChildCount(sourceFile?: SourceFile): number;
        getChildAt(index: number, sourceFile?: SourceFile): Node;
        getChildren(sourceFile?: SourceFile): Node[];
        getStart(sourceFile?: SourceFile, includeJsDocComment?: boolean): number;
        getFullStart(): number;
        getEnd(): number;
        getWidth(sourceFile?: SourceFileLike): number;
        getFullWidth(): number;
        getLeadingTriviaWidth(sourceFile?: SourceFile): number;
        getFullText(sourceFile?: SourceFile): string;
        getText(sourceFile?: SourceFile): string;
        getFirstToken(sourceFile?: SourceFile): Node | undefined;
        getLastToken(sourceFile?: SourceFile): Node | undefined;
        forEachChild<T>(cbNode: (node: Node) => T | undefined, cbNodeArray?: (nodes: NodeArray<Node>) => T | undefined): T | undefined;
    }
    interface Identifier {
        readonly text: string;
    }
    interface Symbol {
        readonly name: string;
        getFlags(): SymbolFlags;
        getEscapedName(): __String;
        getName(): string;
        getDeclarations(): Declaration[] | undefined;
        getDocumentationComment(typeChecker: TypeChecker | undefined): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }
    interface Type {
        getFlags(): TypeFlags;
        getSymbol(): Symbol | undefined;
        getProperties(): Symbol[];
        getProperty(propertyName: string): Symbol | undefined;
        getApparentProperties(): Symbol[];
        getCallSignatures(): Signature[];
        getConstructSignatures(): Signature[];
        getStringIndexType(): Type | undefined;
        getNumberIndexType(): Type | undefined;
        getBaseTypes(): BaseType[] | undefined;
        getNonNullableType(): Type;
        getConstraint(): Type | undefined;
        getDefault(): Type | undefined;
        isUnion(): this is UnionType;
        isIntersection(): this is IntersectionType;
        isUnionOrIntersection(): this is UnionOrIntersectionType;
        isLiteral(): this is LiteralType;
        isStringLiteral(): this is StringLiteralType;
        isNumberLiteral(): this is NumberLiteralType;
        isTypeParameter(): this is TypeParameter;
        isClassOrInterface(): this is InterfaceType;
        isClass(): this is InterfaceType;
    }
    interface Signature {
        getDeclaration(): SignatureDeclaration;
        getTypeParameters(): TypeParameter[] | undefined;
        getParameters(): Symbol[];
        getReturnType(): Type;
        getDocumentationComment(typeChecker: TypeChecker | undefined): SymbolDisplayPart[];
        getJsDocTags(): JSDocTagInfo[];
    }
    interface SourceFile {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
        getLineEndOfPosition(pos: number): number;
        getLineStarts(): ReadonlyArray<number>;
        getPositionOfLineAndCharacter(line: number, character: number): number;
        update(newText: string, textChangeRange: TextChangeRange): SourceFile;
    }
    interface SourceFileLike {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
    }
    interface SourceMapSource {
        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
    }
    /**
     * Represents an immutable snapshot of a script at a specified time.Once acquired, the
     * snapshot is observably immutable. i.e. the same calls with the same parameters will return
     * the same values.
     */
    interface IScriptSnapshot {
        /** Gets a portion of the script snapshot specified by [start, end). */
        getText(start: number, end: number): string;
        /** Gets the length of this script snapshot. */
        getLength(): number;
        /**
         * Gets the TextChangeRange that describe how the text changed between this text and
         * an older version.  This information is used by the incremental parser to determine
         * what sections of the script need to be re-parsed.  'undefined' can be returned if the
         * change range cannot be determined.  However, in that case, incremental parsing will
         * not happen and the entire document will be re - parsed.
         */
        getChangeRange(oldSnapshot: IScriptSnapshot): TextChangeRange | undefined;
        /** Releases all resources held by this script snapshot */
        dispose?(): void;
    }
    namespace ScriptSnapshot {
        function fromString(text: string): IScriptSnapshot;
    }
    interface PreProcessedFileInfo {
        referencedFiles: FileReference[];
        typeReferenceDirectives: FileReference[];
        libReferenceDirectives: FileReference[];
        importedFiles: FileReference[];
        ambientExternalModules?: string[];
        isLibFile: boolean;
    }
    interface HostCancellationToken {
        isCancellationRequested(): boolean;
    }
    interface InstallPackageOptions {
        fileName: Path;
        packageName: string;
    }
    interface LanguageServiceHost extends GetEffectiveTypeRootsHost {
        getCompilationSettings(): CompilerOptions;
        getNewLine?(): string;
        getProjectVersion?(): string;
        getScriptFileNames(): string[];
        getScriptKind?(fileName: string): ScriptKind;
        getScriptVersion(fileName: string): string;
        getScriptSnapshot(fileName: string): IScriptSnapshot | undefined;
        getProjectReferences?(): ReadonlyArray<ProjectReference> | undefined;
        getLocalizedDiagnosticMessages?(): any;
        getCancellationToken?(): HostCancellationToken;
        getCurrentDirectory(): string;
        getDefaultLibFileName(options: CompilerOptions): string;
        log?(s: string): void;
        trace?(s: string): void;
        error?(s: string): void;
        useCaseSensitiveFileNames?(): boolean;
        readDirectory?(path: string, extensions?: ReadonlyArray<string>, exclude?: ReadonlyArray<string>, include?: ReadonlyArray<string>, depth?: number): string[];
        readFile?(path: string, encoding?: string): string | undefined;
        realpath?(path: string): string;
        fileExists?(path: string): boolean;
        getTypeRootsVersion?(): number;
        resolveModuleNames?(moduleNames: string[], containingFile: string, reusedNames?: string[]): ResolvedModule[];
        getResolvedModuleWithFailedLookupLocationsFromCache?(modulename: string, containingFile: string): ResolvedModuleWithFailedLookupLocations | undefined;
        resolveTypeReferenceDirectives?(typeDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
        getDirectories?(directoryName: string): string[];
        /**
         * Gets a set of custom transformers to use during emit.
         */
        getCustomTransformers?(): CustomTransformers | undefined;
        isKnownTypesPackageName?(name: string): boolean;
        installPackage?(options: InstallPackageOptions): Promise<ApplyCodeActionCommandResult>;
    }
    interface UserPreferences {
        readonly disableSuggestions?: boolean;
        readonly quotePreference?: "double" | "single";
        readonly includeCompletionsForModuleExports?: boolean;
        readonly includeCompletionsWithInsertText?: boolean;
        readonly importModuleSpecifierPreference?: "relative" | "non-relative";
        readonly allowTextChangesInNewFiles?: boolean;
    }
    interface LanguageService {
        cleanupSemanticCache(): void;
        getSyntacticDiagnostics(fileName: string): DiagnosticWithLocation[];
        /** The first time this is called, it will return global diagnostics (no location). */
        getSemanticDiagnostics(fileName: string): Diagnostic[];
        getSuggestionDiagnostics(fileName: string): DiagnosticWithLocation[];
        getCompilerOptionsDiagnostics(): Diagnostic[];
        /**
         * @deprecated Use getEncodedSyntacticClassifications instead.
         */
        getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];
        /**
         * @deprecated Use getEncodedSemanticClassifications instead.
         */
        getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];
        getEncodedSyntacticClassifications(fileName: string, span: TextSpan): Classifications;
        getEncodedSemanticClassifications(fileName: string, span: TextSpan): Classifications;
        getCompletionsAtPosition(fileName: string, position: number, options: GetCompletionsAtPositionOptions | undefined): CompletionInfo | undefined;
        getCompletionEntryDetails(fileName: string, position: number, name: string, formatOptions: FormatCodeOptions | FormatCodeSettings | undefined, source: string | undefined, preferences: UserPreferences | undefined): CompletionEntryDetails | undefined;
        getCompletionEntrySymbol(fileName: string, position: number, name: string, source: string | undefined): Symbol | undefined;
        getQuickInfoAtPosition(fileName: string, position: number): QuickInfo | undefined;
        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan | undefined;
        getBreakpointStatementAtPosition(fileName: string, position: number): TextSpan | undefined;
        getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems | undefined;
        getRenameInfo(fileName: string, position: number): RenameInfo;
        findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[] | undefined;
        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] | undefined;
        getDefinitionAndBoundSpan(fileName: string, position: number): DefinitionInfoAndBoundSpan | undefined;
        getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] | undefined;
        getImplementationAtPosition(fileName: string, position: number): ImplementationLocation[] | undefined;
        getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[] | undefined;
        findReferences(fileName: string, position: number): ReferencedSymbol[] | undefined;
        getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[] | undefined;
        /** @deprecated */
        getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[] | undefined;
        getNavigateToItems(searchValue: string, maxResultCount?: number, fileName?: string, excludeDtsFiles?: boolean): NavigateToItem[];
        getNavigationBarItems(fileName: string): NavigationBarItem[];
        getNavigationTree(fileName: string): NavigationTree;
        getOutliningSpans(fileName: string): OutliningSpan[];
        getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[];
        getBraceMatchingAtPosition(fileName: string, position: number): TextSpan[];
        getIndentationAtPosition(fileName: string, position: number, options: EditorOptions | EditorSettings): number;
        getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions | FormatCodeSettings): TextChange[];
        getDocCommentTemplateAtPosition(fileName: string, position: number): TextInsertion | undefined;
        isValidBraceCompletionAtPosition(fileName: string, position: number, openingBrace: number): boolean;
        /**
         * This will return a defined result if the position is after the `>` of the opening tag, or somewhere in the text, of a JSXElement with no closing tag.
         * Editors should call this after `>` is typed.
         */
        getJsxClosingTagAtPosition(fileName: string, position: number): JsxClosingTagInfo | undefined;
        getSpanOfEnclosingComment(fileName: string, position: number, onlyMultiLine: boolean): TextSpan | undefined;
        toLineColumnOffset?(fileName: string, position: number): LineAndCharacter;
        getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: ReadonlyArray<number>, formatOptions: FormatCodeSettings, preferences: UserPreferences): ReadonlyArray<CodeFixAction>;
        getCombinedCodeFix(scope: CombinedCodeFixScope, fixId: {}, formatOptions: FormatCodeSettings, preferences: UserPreferences): CombinedCodeActions;
        applyCodeActionCommand(action: CodeActionCommand): Promise<ApplyCodeActionCommandResult>;
        applyCodeActionCommand(action: CodeActionCommand[]): Promise<ApplyCodeActionCommandResult[]>;
        applyCodeActionCommand(action: CodeActionCommand | CodeActionCommand[]): Promise<ApplyCodeActionCommandResult | ApplyCodeActionCommandResult[]>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand): Promise<ApplyCodeActionCommandResult>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand[]): Promise<ApplyCodeActionCommandResult[]>;
        /** @deprecated `fileName` will be ignored */
        applyCodeActionCommand(fileName: string, action: CodeActionCommand | CodeActionCommand[]): Promise<ApplyCodeActionCommandResult | ApplyCodeActionCommandResult[]>;
        getApplicableRefactors(fileName: string, positionOrRange: number | TextRange, preferences: UserPreferences | undefined): ApplicableRefactorInfo[];
        getEditsForRefactor(fileName: string, formatOptions: FormatCodeSettings, positionOrRange: number | TextRange, refactorName: string, actionName: string, preferences: UserPreferences | undefined): RefactorEditInfo | undefined;
        organizeImports(scope: OrganizeImportsScope, formatOptions: FormatCodeSettings, preferences: UserPreferences | undefined): ReadonlyArray<FileTextChanges>;
        getEditsForFileRename(oldFilePath: string, newFilePath: string, formatOptions: FormatCodeSettings, preferences: UserPreferences | undefined): ReadonlyArray<FileTextChanges>;
        getEmitOutput(fileName: string, emitOnlyDtsFiles?: boolean): EmitOutput;
        getProgram(): Program | undefined;
        dispose(): void;
    }
    interface JsxClosingTagInfo {
        readonly newText: string;
    }
    interface CombinedCodeFixScope {
        type: "file";
        fileName: string;
    }
    type OrganizeImportsScope = CombinedCodeFixScope;
    type CompletionsTriggerCharacter = "." | '"' | "'" | "`" | "/" | "@" | "<";
    interface GetCompletionsAtPositionOptions extends UserPreferences {
        /** If the editor is asking for completions because a certain character was typed, and not because the user explicitly requested them, this should be set. */
        triggerCharacter?: CompletionsTriggerCharacter;
        /** @deprecated Use includeCompletionsForModuleExports */
        includeExternalModuleExports?: boolean;
        /** @deprecated Use includeCompletionsWithInsertText */
        includeInsertTextCompletions?: boolean;
    }
    interface ApplyCodeActionCommandResult {
        successMessage: string;
    }
    interface Classifications {
        spans: number[];
        endOfLineState: EndOfLineState;
    }
    interface ClassifiedSpan {
        textSpan: TextSpan;
        classificationType: ClassificationTypeNames;
    }
    /**
     * Navigation bar interface designed for visual studio's dual-column layout.
     * This does not form a proper tree.
     * The navbar is returned as a list of top-level items, each of which has a list of child items.
     * Child items always have an empty array for their `childItems`.
     */
    interface NavigationBarItem {
        text: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        spans: TextSpan[];
        childItems: NavigationBarItem[];
        indent: number;
        bolded: boolean;
        grayed: boolean;
    }
    /**
     * Node in a tree of nested declarations in a file.
     * The top node is always a script or module node.
     */
    interface NavigationTree {
        /** Name of the declaration, or a short description, e.g. "<class>". */
        text: string;
        kind: ScriptElementKind;
        /** ScriptElementKindModifier separated by commas, e.g. "public,abstract" */
        kindModifiers: string;
        /**
         * Spans of the nodes that generated this declaration.
         * There will be more than one if this is the result of merging.
         */
        spans: TextSpan[];
        nameSpan: TextSpan | undefined;
        /** Present if non-empty */
        childItems?: NavigationTree[];
    }
    interface TodoCommentDescriptor {
        text: string;
        priority: number;
    }
    interface TodoComment {
        descriptor: TodoCommentDescriptor;
        message: string;
        position: number;
    }
    class TextChange {
        span: TextSpan;
        newText: string;
    }
    interface FileTextChanges {
        fileName: string;
        textChanges: TextChange[];
        isNewFile?: boolean;
    }
    interface CodeAction {
        /** Description of the code action to display in the UI of the editor */
        description: string;
        /** Text changes to apply to each file as part of the code action */
        changes: FileTextChanges[];
        /**
         * If the user accepts the code fix, the editor should send the action back in a `applyAction` request.
         * This allows the language service to have side effects (e.g. installing dependencies) upon a code fix.
         */
        commands?: CodeActionCommand[];
    }
    interface CodeFixAction extends CodeAction {
        /** Short name to identify the fix, for use by telemetry. */
        fixName: string;
        /**
         * If present, one may call 'getCombinedCodeFix' with this fixId.
         * This may be omitted to indicate that the code fix can't be applied in a group.
         */
        fixId?: {};
        fixAllDescription?: string;
    }
    interface CombinedCodeActions {
        changes: ReadonlyArray<FileTextChanges>;
        commands?: ReadonlyArray<CodeActionCommand>;
    }
    type CodeActionCommand = InstallPackageAction;
    interface InstallPackageAction {
    }
    /**
     * A set of one or more available refactoring actions, grouped under a parent refactoring.
     */
    interface ApplicableRefactorInfo {
        /**
         * The programmatic name of the refactoring
         */
        name: string;
        /**
         * A description of this refactoring category to show to the user.
         * If the refactoring gets inlined (see below), this text will not be visible.
         */
        description: string;
        /**
         * Inlineable refactorings can have their actions hoisted out to the top level
         * of a context menu. Non-inlineanable refactorings should always be shown inside
         * their parent grouping.
         *
         * If not specified, this value is assumed to be 'true'
         */
        inlineable?: boolean;
        actions: RefactorActionInfo[];
    }
    /**
     * Represents a single refactoring action - for example, the "Extract Method..." refactor might
     * offer several actions, each corresponding to a surround class or closure to extract into.
     */
    interface RefactorActionInfo {
        /**
         * The programmatic name of the refactoring action
         */
        name: string;
        /**
         * A description of this refactoring action to show to the user.
         * If the parent refactoring is inlined away, this will be the only text shown,
         * so this description should make sense by itself if the parent is inlineable=true
         */
        description: string;
    }
    /**
     * A set of edits to make in response to a refactor action, plus an optional
     * location where renaming should be invoked from
     */
    interface RefactorEditInfo {
        edits: FileTextChanges[];
        renameFilename?: string;
        renameLocation?: number;
        commands?: CodeActionCommand[];
    }
    interface TextInsertion {
        newText: string;
        /** The position in newText the caret should point to after the insertion. */
        caretOffset: number;
    }
    interface DocumentSpan {
        textSpan: TextSpan;
        fileName: string;
        /**
         * If the span represents a location that was remapped (e.g. via a .d.ts.map file),
         * then the original filename and span will be specified here
         */
        originalTextSpan?: TextSpan;
        originalFileName?: string;
    }
    interface RenameLocation extends DocumentSpan {
    }
    interface ReferenceEntry extends DocumentSpan {
        isWriteAccess: boolean;
        isDefinition: boolean;
        isInString?: true;
    }
    interface ImplementationLocation extends DocumentSpan {
        kind: ScriptElementKind;
        displayParts: SymbolDisplayPart[];
    }
    interface DocumentHighlights {
        fileName: string;
        highlightSpans: HighlightSpan[];
    }
    enum HighlightSpanKind {
        none = "none",
        definition = "definition",
        reference = "reference",
        writtenReference = "writtenReference"
    }
    interface HighlightSpan {
        fileName?: string;
        isInString?: true;
        textSpan: TextSpan;
        kind: HighlightSpanKind;
    }
    interface NavigateToItem {
        name: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        matchKind: string;
        isCaseSensitive: boolean;
        fileName: string;
        textSpan: TextSpan;
        containerName: string;
        containerKind: ScriptElementKind;
    }
    enum IndentStyle {
        None = 0,
        Block = 1,
        Smart = 2
    }
    interface EditorOptions {
        BaseIndentSize?: number;
        IndentSize: number;
        TabSize: number;
        NewLineCharacter: string;
        ConvertTabsToSpaces: boolean;
        IndentStyle: IndentStyle;
    }
    interface EditorSettings {
        baseIndentSize?: number;
        indentSize?: number;
        tabSize?: number;
        newLineCharacter?: string;
        convertTabsToSpaces?: boolean;
        indentStyle?: IndentStyle;
    }
    interface FormatCodeOptions extends EditorOptions {
        InsertSpaceAfterCommaDelimiter: boolean;
        InsertSpaceAfterSemicolonInForStatements: boolean;
        InsertSpaceBeforeAndAfterBinaryOperators: boolean;
        InsertSpaceAfterConstructor?: boolean;
        InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        InsertSpaceAfterTypeAssertion?: boolean;
        InsertSpaceBeforeFunctionParenthesis?: boolean;
        PlaceOpenBraceOnNewLineForFunctions: boolean;
        PlaceOpenBraceOnNewLineForControlBlocks: boolean;
        insertSpaceBeforeTypeAnnotation?: boolean;
    }
    interface FormatCodeSettings extends EditorSettings {
        insertSpaceAfterCommaDelimiter?: boolean;
        insertSpaceAfterSemicolonInForStatements?: boolean;
        insertSpaceBeforeAndAfterBinaryOperators?: boolean;
        insertSpaceAfterConstructor?: boolean;
        insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
        insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces?: boolean;
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        insertSpaceAfterTypeAssertion?: boolean;
        insertSpaceBeforeFunctionParenthesis?: boolean;
        placeOpenBraceOnNewLineForFunctions?: boolean;
        placeOpenBraceOnNewLineForControlBlocks?: boolean;
        insertSpaceBeforeTypeAnnotation?: boolean;
        indentMultiLineObjectLiteralBeginningOnBlankLine?: boolean;
    }
    interface DefinitionInfo extends DocumentSpan {
        kind: ScriptElementKind;
        name: string;
        containerKind: ScriptElementKind;
        containerName: string;
    }
    interface DefinitionInfoAndBoundSpan {
        definitions?: ReadonlyArray<DefinitionInfo>;
        textSpan: TextSpan;
    }
    interface ReferencedSymbolDefinitionInfo extends DefinitionInfo {
        displayParts: SymbolDisplayPart[];
    }
    interface ReferencedSymbol {
        definition: ReferencedSymbolDefinitionInfo;
        references: ReferenceEntry[];
    }
    enum SymbolDisplayPartKind {
        aliasName = 0,
        className = 1,
        enumName = 2,
        fieldName = 3,
        interfaceName = 4,
        keyword = 5,
        lineBreak = 6,
        numericLiteral = 7,
        stringLiteral = 8,
        localName = 9,
        methodName = 10,
        moduleName = 11,
        operator = 12,
        parameterName = 13,
        propertyName = 14,
        punctuation = 15,
        space = 16,
        text = 17,
        typeParameterName = 18,
        enumMemberName = 19,
        functionName = 20,
        regularExpressionLiteral = 21
    }
    interface SymbolDisplayPart {
        text: string;
        kind: string;
    }
    interface JSDocTagInfo {
        name: string;
        text?: string;
    }
    interface QuickInfo {
        kind: ScriptElementKind;
        kindModifiers: string;
        textSpan: TextSpan;
        displayParts?: SymbolDisplayPart[];
        documentation?: SymbolDisplayPart[];
        tags?: JSDocTagInfo[];
    }
    interface RenameInfo {
        canRename: boolean;
        localizedErrorMessage?: string;
        displayName: string;
        fullDisplayName: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        triggerSpan: TextSpan;
    }
    interface SignatureHelpParameter {
        name: string;
        documentation: SymbolDisplayPart[];
        displayParts: SymbolDisplayPart[];
        isOptional: boolean;
    }
    /**
     * Represents a single signature to show in signature help.
     * The id is used for subsequent calls into the language service to ask questions about the
     * signature help item in the context of any documents that have been updated.  i.e. after
     * an edit has happened, while signature help is still active, the host can ask important
     * questions like 'what parameter is the user currently contained within?'.
     */
    interface SignatureHelpItem {
        isVariadic: boolean;
        prefixDisplayParts: SymbolDisplayPart[];
        suffixDisplayParts: SymbolDisplayPart[];
        separatorDisplayParts: SymbolDisplayPart[];
        parameters: SignatureHelpParameter[];
        documentation: SymbolDisplayPart[];
        tags: JSDocTagInfo[];
    }
    /**
     * Represents a set of signature help items, and the preferred item that should be selected.
     */
    interface SignatureHelpItems {
        items: SignatureHelpItem[];
        applicableSpan: TextSpan;
        selectedItemIndex: number;
        argumentIndex: number;
        argumentCount: number;
    }
    interface CompletionInfo {
        /** Not true for all glboal completions. This will be true if the enclosing scope matches a few syntax kinds. See `isSnippetScope`. */
        isGlobalCompletion: boolean;
        isMemberCompletion: boolean;
        /**
         * true when the current location also allows for a new identifier
         */
        isNewIdentifierLocation: boolean;
        entries: CompletionEntry[];
    }
    interface CompletionEntry {
        name: string;
        kind: ScriptElementKind;
        kindModifiers?: string;
        sortText: string;
        insertText?: string;
        /**
         * An optional span that indicates the text to be replaced by this completion item.
         * If present, this span should be used instead of the default one.
         * It will be set if the required span differs from the one generated by the default replacement behavior.
         */
        replacementSpan?: TextSpan;
        hasAction?: true;
        source?: string;
        isRecommended?: true;
    }
    interface CompletionEntryDetails {
        name: string;
        kind: ScriptElementKind;
        kindModifiers: string;
        displayParts: SymbolDisplayPart[];
        documentation?: SymbolDisplayPart[];
        tags?: JSDocTagInfo[];
        codeActions?: CodeAction[];
        source?: SymbolDisplayPart[];
    }
    interface OutliningSpan {
        /** The span of the document to actually collapse. */
        textSpan: TextSpan;
        /** The span of the document to display when the user hovers over the collapsed span. */
        hintSpan: TextSpan;
        /** The text to display in the editor for the collapsed region. */
        bannerText: string;
        /**
         * Whether or not this region should be automatically collapsed when
         * the 'Collapse to Definitions' command is invoked.
         */
        autoCollapse: boolean;
        /**
         * Classification of the contents of the span
         */
        kind: OutliningSpanKind;
    }
    enum OutliningSpanKind {
        /** Single or multi-line comments */
        Comment = "comment",
        /** Sections marked by '// #region' and '// #endregion' comments */
        Region = "region",
        /** Declarations and expressions */
        Code = "code",
        /** Contiguous blocks of import declarations */
        Imports = "imports"
    }
    enum OutputFileType {
        JavaScript = 0,
        SourceMap = 1,
        Declaration = 2
    }
    enum EndOfLineState {
        None = 0,
        InMultiLineCommentTrivia = 1,
        InSingleQuoteStringLiteral = 2,
        InDoubleQuoteStringLiteral = 3,
        InTemplateHeadOrNoSubstitutionTemplate = 4,
        InTemplateMiddleOrTail = 5,
        InTemplateSubstitutionPosition = 6
    }
    enum TokenClass {
        Punctuation = 0,
        Keyword = 1,
        Operator = 2,
        Comment = 3,
        Whitespace = 4,
        Identifier = 5,
        NumberLiteral = 6,
        StringLiteral = 7,
        RegExpLiteral = 8
    }
    interface ClassificationResult {
        finalLexState: EndOfLineState;
        entries: ClassificationInfo[];
    }
    interface ClassificationInfo {
        length: number;
        classification: TokenClass;
    }
    interface Classifier {
        /**
         * Gives lexical classifications of tokens on a line without any syntactic context.
         * For instance, a token consisting of the text 'string' can be either an identifier
         * named 'string' or the keyword 'string', however, because this classifier is not aware,
         * it relies on certain heuristics to give acceptable results. For classifications where
         * speed trumps accuracy, this function is preferable; however, for true accuracy, the
         * syntactic classifier is ideal. In fact, in certain editing scenarios, combining the
         * lexical, syntactic, and semantic classifiers may issue the best user experience.
         *
         * @param text                      The text of a line to classify.
         * @param lexState                  The state of the lexical classifier at the end of the previous line.
         * @param syntacticClassifierAbsent Whether the client is *not* using a syntactic classifier.
         *                                  If there is no syntactic classifier (syntacticClassifierAbsent=true),
         *                                  certain heuristics may be used in its place; however, if there is a
         *                                  syntactic classifier (syntacticClassifierAbsent=false), certain
         *                                  classifications which may be incorrectly categorized will be given
         *                                  back as Identifiers in order to allow the syntactic classifier to
         *                                  subsume the classification.
         * @deprecated Use getLexicalClassifications instead.
         */
        getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult;
        getEncodedLexicalClassifications(text: string, endOfLineState: EndOfLineState, syntacticClassifierAbsent: boolean): Classifications;
    }
    enum ScriptElementKind {
        unknown = "",
        warning = "warning",
        /** predefined type (void) or keyword (class) */
        keyword = "keyword",
        /** top level script node */
        scriptElement = "script",
        /** module foo {} */
        moduleElement = "module",
        /** class X {} */
        classElement = "class",
        /** var x = class X {} */
        localClassElement = "local class",
        /** interface Y {} */
        interfaceElement = "interface",
        /** type T = ... */
        typeElement = "type",
        /** enum E */
        enumElement = "enum",
        enumMemberElement = "enum member",
        /**
         * Inside module and script only
         * const v = ..
         */
        variableElement = "var",
        /** Inside function */
        localVariableElement = "local var",
        /**
         * Inside module and script only
         * function f() { }
         */
        functionElement = "function",
        /** Inside function */
        localFunctionElement = "local function",
        /** class X { [public|private]* foo() {} } */
        memberFunctionElement = "method",
        /** class X { [public|private]* [get|set] foo:number; } */
        memberGetAccessorElement = "getter",
        memberSetAccessorElement = "setter",
        /**
         * class X { [public|private]* foo:number; }
         * interface Y { foo:number; }
         */
        memberVariableElement = "property",
        /** class X { constructor() { } } */
        constructorImplementationElement = "constructor",
        /** interface Y { ():number; } */
        callSignatureElement = "call",
        /** interface Y { []:number; } */
        indexSignatureElement = "index",
        /** interface Y { new():Y; } */
        constructSignatureElement = "construct",
        /** function foo(*Y*: string) */
        parameterElement = "parameter",
        typeParameterElement = "type parameter",
        primitiveType = "primitive type",
        label = "label",
        alias = "alias",
        constElement = "const",
        letElement = "let",
        directory = "directory",
        externalModuleName = "external module name",
        /**
         * <JsxTagName attribute1 attribute2={0} />
         */
        jsxAttribute = "JSX attribute",
        /** String literal */
        string = "string"
    }
    enum ScriptElementKindModifier {
        none = "",
        publicMemberModifier = "public",
        privateMemberModifier = "private",
        protectedMemberModifier = "protected",
        exportedModifier = "export",
        ambientModifier = "declare",
        staticModifier = "static",
        abstractModifier = "abstract",
        optionalModifier = "optional"
    }
    enum ClassificationTypeNames {
        comment = "comment",
        identifier = "identifier",
        keyword = "keyword",
        numericLiteral = "number",
        operator = "operator",
        stringLiteral = "string",
        whiteSpace = "whitespace",
        text = "text",
        punctuation = "punctuation",
        className = "class name",
        enumName = "enum name",
        interfaceName = "interface name",
        moduleName = "module name",
        typeParameterName = "type parameter name",
        typeAliasName = "type alias name",
        parameterName = "parameter name",
        docCommentTagName = "doc comment tag name",
        jsxOpenTagName = "jsx open tag name",
        jsxCloseTagName = "jsx close tag name",
        jsxSelfClosingTagName = "jsx self closing tag name",
        jsxAttribute = "jsx attribute",
        jsxText = "jsx text",
        jsxAttributeStringLiteralValue = "jsx attribute string literal value"
    }
    enum ClassificationType {
        comment = 1,
        identifier = 2,
        keyword = 3,
        numericLiteral = 4,
        operator = 5,
        stringLiteral = 6,
        regularExpressionLiteral = 7,
        whiteSpace = 8,
        text = 9,
        punctuation = 10,
        className = 11,
        enumName = 12,
        interfaceName = 13,
        moduleName = 14,
        typeParameterName = 15,
        typeAliasName = 16,
        parameterName = 17,
        docCommentTagName = 18,
        jsxOpenTagName = 19,
        jsxCloseTagName = 20,
        jsxSelfClosingTagName = 21,
        jsxAttribute = 22,
        jsxText = 23,
        jsxAttributeStringLiteralValue = 24
    }
}
declare namespace ts {
    function createClassifier(): Classifier;
}
declare namespace ts {
    /**
     * The document registry represents a store of SourceFile objects that can be shared between
     * multiple LanguageService instances. A LanguageService instance holds on the SourceFile (AST)
     * of files in the context.
     * SourceFile objects account for most of the memory usage by the language service. Sharing
     * the same DocumentRegistry instance between different instances of LanguageService allow
     * for more efficient memory utilization since all projects will share at least the library
     * file (lib.d.ts).
     *
     * A more advanced use of the document registry is to serialize sourceFile objects to disk
     * and re-hydrate them when needed.
     *
     * To create a default DocumentRegistry, use createDocumentRegistry to create one, and pass it
     * to all subsequent createLanguageService calls.
     */
    interface DocumentRegistry {
        /**
         * Request a stored SourceFile with a given fileName and compilationSettings.
         * The first call to acquire will call createLanguageServiceSourceFile to generate
         * the SourceFile if was not found in the registry.
         *
         * @param fileName The name of the file requested
         * @param compilationSettings Some compilation settings like target affects the
         * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
         * multiple copies of the same file for different compilation settings.
         * @param scriptSnapshot Text of the file. Only used if the file was not found
         * in the registry and a new one was created.
         * @param version Current version of the file. Only used if the file was not found
         * in the registry and a new one was created.
         */
        acquireDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        acquireDocumentWithKey(fileName: string, path: Path, compilationSettings: CompilerOptions, key: DocumentRegistryBucketKey, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        /**
         * Request an updated version of an already existing SourceFile with a given fileName
         * and compilationSettings. The update will in-turn call updateLanguageServiceSourceFile
         * to get an updated SourceFile.
         *
         * @param fileName The name of the file requested
         * @param compilationSettings Some compilation settings like target affects the
         * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
         * multiple copies of the same file for different compilation settings.
         * @param scriptSnapshot Text of the file.
         * @param version Current version of the file.
         */
        updateDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        updateDocumentWithKey(fileName: string, path: Path, compilationSettings: CompilerOptions, key: DocumentRegistryBucketKey, scriptSnapshot: IScriptSnapshot, version: string, scriptKind?: ScriptKind): SourceFile;
        getKeyForCompilationSettings(settings: CompilerOptions): DocumentRegistryBucketKey;
        /**
         * Informs the DocumentRegistry that a file is not needed any longer.
         *
         * Note: It is not allowed to call release on a SourceFile that was not acquired from
         * this registry originally.
         *
         * @param fileName The name of the file to be released
         * @param compilationSettings The compilation settings used to acquire the file
         */
        releaseDocument(fileName: string, compilationSettings: CompilerOptions): void;
        releaseDocumentWithKey(path: Path, key: DocumentRegistryBucketKey): void;
        reportStats(): string;
    }
    type DocumentRegistryBucketKey = string & {
        __bucketKey: any;
    };
    function createDocumentRegistry(useCaseSensitiveFileNames?: boolean, currentDirectory?: string): DocumentRegistry;
}
declare namespace ts {
    function preProcessFile(sourceText: string, readImportFiles?: boolean, detectJavaScriptImports?: boolean): PreProcessedFileInfo;
}
declare namespace ts {
    interface TranspileOptions {
        compilerOptions?: CompilerOptions;
        fileName?: string;
        reportDiagnostics?: boolean;
        moduleName?: string;
        renamedDependencies?: MapLike<string>;
        transformers?: CustomTransformers;
    }
    interface TranspileOutput {
        outputText: string;
        diagnostics?: Diagnostic[];
        sourceMapText?: string;
    }
    function transpileModule(input: string, transpileOptions: TranspileOptions): TranspileOutput;
    function transpile(input: string, compilerOptions?: CompilerOptions, fileName?: string, diagnostics?: Diagnostic[], moduleName?: string): string;
<<<<<<< HEAD
=======
    /** JS users may pass in string values for enum compiler options (such as ModuleKind), so convert. */
    function fixupCompilerOptions(options: CompilerOptions, diagnostics: Diagnostic[]): CompilerOptions;
}
declare namespace ts.formatting {
    enum FormattingRequestKind {
        FormatDocument = 0,
        FormatSelection = 1,
        FormatOnEnter = 2,
        FormatOnSemicolon = 3,
        FormatOnOpeningCurlyBrace = 4,
        FormatOnClosingCurlyBrace = 5
    }
    class FormattingContext {
        readonly sourceFile: SourceFileLike;
        formattingRequestKind: FormattingRequestKind;
        options: FormatCodeSettings;
        currentTokenSpan: TextRangeWithKind;
        nextTokenSpan: TextRangeWithKind;
        contextNode: Node;
        currentTokenParent: Node;
        nextTokenParent: Node;
        private contextNodeAllOnSameLine;
        private nextNodeAllOnSameLine;
        private tokensAreOnSameLine;
        private contextNodeBlockIsOnOneLine;
        private nextNodeBlockIsOnOneLine;
        constructor(sourceFile: SourceFileLike, formattingRequestKind: FormattingRequestKind, options: FormatCodeSettings);
        updateContext(currentRange: TextRangeWithKind, currentTokenParent: Node, nextRange: TextRangeWithKind, nextTokenParent: Node, commonParent: Node): void;
        ContextNodeAllOnSameLine(): boolean;
        NextNodeAllOnSameLine(): boolean;
        TokensAreOnSameLine(): boolean;
        ContextNodeBlockIsOnOneLine(): boolean;
        NextNodeBlockIsOnOneLine(): boolean;
        private NodeIsOnOneLine;
        private BlockIsOnOneLine;
    }
}
declare namespace ts.formatting {
    interface FormattingScanner {
        advance(): void;
        isOnToken(): boolean;
        readTokenInfo(n: Node): TokenInfo;
        getCurrentLeadingTrivia(): TextRangeWithKind[] | undefined;
        lastTrailingTriviaWasNewLine(): boolean;
        skipToEndOf(node: Node): void;
    }
    function getFormattingScanner<T>(text: string, languageVariant: LanguageVariant, startPos: number, endPos: number, cb: (scanner: FormattingScanner) => T): T;
}
declare namespace ts.formatting {
    interface Rule {
        readonly debugName: string;
        readonly context: ReadonlyArray<ContextPredicate>;
        readonly action: RuleAction;
        readonly flags: RuleFlags;
    }
    type ContextPredicate = (context: FormattingContext) => boolean;
    const anyContext: ReadonlyArray<ContextPredicate>;
    enum RuleAction {
        Ignore = 1,
        Space = 2,
        NewLine = 4,
        Delete = 8
    }
    enum RuleFlags {
        None = 0,
        CanDeleteNewLines = 1
    }
    interface TokenRange {
        readonly tokens: ReadonlyArray<SyntaxKind>;
        readonly isSpecific: boolean;
    }
}
declare namespace ts.formatting {
    interface RuleSpec {
        readonly leftTokenRange: TokenRange;
        readonly rightTokenRange: TokenRange;
        readonly rule: Rule;
    }
    function getAllRules(): RuleSpec[];
}
declare namespace ts.formatting {
    function getFormatContext(options: FormatCodeSettings): FormatContext;
    type RulesMap = (context: FormattingContext) => Rule | undefined;
}
declare namespace ts.formatting {
    interface FormatContext {
        readonly options: FormatCodeSettings;
        readonly getRule: RulesMap;
    }
    interface TextRangeWithKind extends TextRange {
        kind: SyntaxKind;
    }
    interface TextRangeWithTriviaKind extends TextRange {
        kind: TriviaKind;
    }
    interface TokenInfo {
        leadingTrivia: TextRangeWithTriviaKind[] | undefined;
        token: TextRangeWithKind;
        trailingTrivia: TextRangeWithTriviaKind[] | undefined;
    }
    function formatOnEnter(position: number, sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatOnSemicolon(position: number, sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatOnOpeningCurly(position: number, sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatOnClosingCurly(position: number, sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatDocument(sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatSelection(start: number, end: number, sourceFile: SourceFile, formatContext: FormatContext): TextChange[];
    function formatNodeGivenIndentation(node: Node, sourceFileLike: SourceFileLike, languageVariant: LanguageVariant, initialIndentation: number, delta: number, formatContext: FormatContext): TextChange[];
    /**
     * @param precedingToken pass `null` if preceding token was already computed and result was `undefined`.
     */
    function getRangeOfEnclosingComment(sourceFile: SourceFile, position: number, onlyMultiLine: boolean, precedingToken?: Node | null, // tslint:disable-line:no-null-keyword
    tokenAtPosition?: Node, predicate?: (c: CommentRange) => boolean): CommentRange | undefined;
    function getIndentationString(indentation: number, options: EditorSettings): string;
}
declare namespace ts.formatting {
    namespace SmartIndenter {
        /**
         * @param assumeNewLineBeforeCloseBrace
         * `false` when called on text from a real source file.
         * `true` when we need to assume `position` is on a newline.
         *
         * This is useful for codefixes. Consider
         * ```
         * function f() {
         * |}
         * ```
         * with `position` at `|`.
         *
         * When inserting some text after an open brace, we would like to get indentation as if a newline was already there.
         * By default indentation at `position` will be 0 so 'assumeNewLineBeforeCloseBrace' overrides this behavior.
         */
        function getIndentation(position: number, sourceFile: SourceFile, options: EditorSettings, assumeNewLineBeforeCloseBrace?: boolean): number;
        function getIndentationForNode(n: Node, ignoreActualIndentationRange: TextRange, sourceFile: SourceFile, options: EditorSettings): number;
        function getBaseIndentation(options: EditorSettings): number;
        function isArgumentAndStartLineOverlapsExpressionBeingCalled(parent: Node, child: Node, childStartLine: number, sourceFile: SourceFileLike): boolean;
        function childStartsOnTheSameLineWithElseInIfStatement(parent: Node, child: TextRangeWithKind, childStartLine: number, sourceFile: SourceFileLike): boolean;
        function getContainingList(node: Node, sourceFile: SourceFile): NodeArray<Node> | undefined;
        /**
         * Character is the actual index of the character since the beginning of the line.
         * Column - position of the character after expanding tabs to spaces.
         * "0\t2$"
         * value of 'character' for '$' is 3
         * value of 'column' for '$' is 6 (assuming that tab size is 4)
         */
        function findFirstNonWhitespaceCharacterAndColumn(startPos: number, endPos: number, sourceFile: SourceFileLike, options: EditorSettings): {
            column: number;
            character: number;
        };
        function findFirstNonWhitespaceColumn(startPos: number, endPos: number, sourceFile: SourceFileLike, options: EditorSettings): number;
        function nodeWillIndentChild(settings: FormatCodeSettings, parent: TextRangeWithKind, child: TextRangeWithKind | undefined, sourceFile: SourceFileLike | undefined, indentByDefault: boolean): boolean;
        /**
         * True when the parent node should indent the given child by an explicit rule.
         * @param isNextChild If true, we are judging indent of a hypothetical child *after* this one, not the current child.
         */
        function shouldIndentChildNode(settings: FormatCodeSettings, parent: TextRangeWithKind, child?: Node, sourceFile?: SourceFileLike, isNextChild?: boolean): boolean;
    }
}
declare namespace ts.textChanges {
    interface ConfigurableStart {
        /** True to use getStart() (NB, not getFullStart()) without adjustment. */
        useNonAdjustedStartPosition?: boolean;
    }
    interface ConfigurableEnd {
        /** True to use getEnd() without adjustment. */
        useNonAdjustedEndPosition?: boolean;
    }
    enum Position {
        FullStart = 0,
        Start = 1
    }
    /**
     * Usually node.pos points to a position immediately after the previous token.
     * If this position is used as a beginning of the span to remove - it might lead to removing the trailing trivia of the previous node, i.e:
     * const x; // this is x
     *        ^ - pos for the next variable declaration will point here
     * const y; // this is y
     *        ^ - end for previous variable declaration
     * Usually leading trivia of the variable declaration 'y' should not include trailing trivia (whitespace, comment 'this is x' and newline) from the preceding
     * variable declaration and trailing trivia for 'y' should include (whitespace, comment 'this is y', newline).
     * By default when removing nodes we adjust start and end positions to respect specification of the trivia above.
     * If pos\end should be interpreted literally 'useNonAdjustedStartPosition' or 'useNonAdjustedEndPosition' should be set to true
     */
    interface ConfigurableStartEnd extends ConfigurableStart, ConfigurableEnd {
    }
    const useNonAdjustedPositions: ConfigurableStartEnd;
    interface InsertNodeOptions {
        /**
         * Text to be inserted before the new node
         */
        prefix?: string;
        /**
         * Text to be inserted after the new node
         */
        suffix?: string;
        /**
         * Text of inserted node will be formatted with this indentation, otherwise indentation will be inferred from the old node
         */
        indentation?: number;
        /**
         * Text of inserted node will be formatted with this delta, otherwise delta will be inferred from the new node kind
         */
        delta?: number;
        /**
         * Do not trim leading white spaces in the edit range
         */
        preserveLeadingWhitespace?: boolean;
    }
    interface ReplaceWithMultipleNodesOptions extends InsertNodeOptions {
        readonly joiner?: string;
    }
    interface ChangeNodeOptions extends ConfigurableStartEnd, InsertNodeOptions {
    }
    interface TextChangesContext {
        host: LanguageServiceHost;
        formatContext: formatting.FormatContext;
    }
    type TypeAnnotatable = SignatureDeclaration | VariableDeclaration | ParameterDeclaration | PropertyDeclaration | PropertySignature;
    class ChangeTracker {
        private readonly newLineCharacter;
        private readonly formatContext;
        private readonly changes;
        private readonly newFiles;
        private readonly deletedNodesInLists;
        private readonly classesWithNodesInsertedAtStart;
        static fromContext(context: TextChangesContext): ChangeTracker;
        static with(context: TextChangesContext, cb: (tracker: ChangeTracker) => void): FileTextChanges[];
        /** Public for tests only. Other callers should use `ChangeTracker.with`. */
        constructor(newLineCharacter: string, formatContext: formatting.FormatContext);
        deleteRange(sourceFile: SourceFile, range: TextRange): this;
        /** Warning: This deletes comments too. See `copyComments` in `convertFunctionToEs6Class`. */
        deleteNode(sourceFile: SourceFile, node: Node, options?: ConfigurableStartEnd): this;
        deleteNodeRange(sourceFile: SourceFile, startNode: Node, endNode: Node, options?: ConfigurableStartEnd): this;
        deleteNodeRangeExcludingEnd(sourceFile: SourceFile, startNode: Node, afterEndNode: Node | undefined, options?: ConfigurableStartEnd): void;
        deleteNodeInList(sourceFile: SourceFile, node: Node): this;
        replaceRange(sourceFile: SourceFile, range: TextRange, newNode: Node, options?: InsertNodeOptions): this;
        replaceNode(sourceFile: SourceFile, oldNode: Node, newNode: Node, options?: ChangeNodeOptions): this;
        replaceNodeRange(sourceFile: SourceFile, startNode: Node, endNode: Node, newNode: Node, options?: ChangeNodeOptions): void;
        private replaceRangeWithNodes;
        replaceNodeWithNodes(sourceFile: SourceFile, oldNode: Node, newNodes: ReadonlyArray<Node>, options?: ChangeNodeOptions): this;
        replaceNodeRangeWithNodes(sourceFile: SourceFile, startNode: Node, endNode: Node, newNodes: ReadonlyArray<Node>, options?: ReplaceWithMultipleNodesOptions & ConfigurableStartEnd): this;
        private nextCommaToken;
        replacePropertyAssignment(sourceFile: SourceFile, oldNode: PropertyAssignment, newNode: PropertyAssignment): this;
        private insertNodeAt;
        private insertNodesAt;
        insertNodeAtTopOfFile(sourceFile: SourceFile, newNode: Statement, blankLineBetween: boolean): void;
        insertNodeBefore(sourceFile: SourceFile, before: Node, newNode: Node, blankLineBetween?: boolean): void;
        insertModifierBefore(sourceFile: SourceFile, modifier: SyntaxKind, before: Node): void;
        insertCommentBeforeLine(sourceFile: SourceFile, lineNumber: number, position: number, commentText: string): void;
        replaceRangeWithText(sourceFile: SourceFile, range: TextRange, text: string): void;
        private insertText;
        /** Prefer this over replacing a node with another that has a type annotation, as it avoids reformatting the other parts of the node. */
        tryInsertTypeAnnotation(sourceFile: SourceFile, node: TypeAnnotatable, type: TypeNode): void;
        insertTypeParameters(sourceFile: SourceFile, node: SignatureDeclaration, typeParameters: ReadonlyArray<TypeParameterDeclaration>): void;
        private getOptionsForInsertNodeBefore;
        insertNodeAtConstructorStart(sourceFile: SourceFile, ctr: ConstructorDeclaration, newStatement: Statement): void;
        insertNodeAtConstructorEnd(sourceFile: SourceFile, ctr: ConstructorDeclaration, newStatement: Statement): void;
        private replaceConstructorBody;
        insertNodeAtEndOfScope(sourceFile: SourceFile, scope: Node, newNode: Node): void;
        insertNodeAtClassStart(sourceFile: SourceFile, cls: ClassLikeDeclaration, newElement: ClassElement): void;
        private getInsertNodeAtClassStartPrefixSuffix;
        insertNodeAfterComma(sourceFile: SourceFile, after: Node, newNode: Node): void;
        insertNodeAfter(sourceFile: SourceFile, after: Node, newNode: Node): void;
        insertNodesAfter(sourceFile: SourceFile, after: Node, newNodes: ReadonlyArray<Node>): void;
        private insertNodeAfterWorker;
        private getInsertNodeAfterOptions;
        private getInsertNodeAfterOptionsWorker;
        insertName(sourceFile: SourceFile, node: FunctionExpression | ClassExpression | ArrowFunction, name: string): void;
        insertExportModifier(sourceFile: SourceFile, node: DeclarationStatement | VariableStatement): void;
        /**
         * This function should be used to insert nodes in lists when nodes don't carry separators as the part of the node range,
         * i.e. arguments in arguments lists, parameters in parameter lists etc.
         * Note that separators are part of the node in statements and class elements.
         */
        insertNodeInListAfter(sourceFile: SourceFile, after: Node, newNode: Node, containingList?: NodeArray<Node> | undefined): this;
        private finishClassesWithNodesInsertedAtStart;
        private finishTrailingCommaAfterDeletingNodesInList;
        /**
         * Note: after calling this, the TextChanges object must be discarded!
         * @param validate only for tests
         *    The reason we must validate as part of this method is that `getNonFormattedText` changes the node's positions,
         *    so we can only call this once and can't get the non-formatted text separately.
         */
        getChanges(validate?: ValidateNonFormattedText): FileTextChanges[];
        createNewFile(oldFile: SourceFile, fileName: string, statements: ReadonlyArray<Statement>): void;
    }
    type ValidateNonFormattedText = (node: Node, text: string) => void;
    function applyChanges(text: string, changes: TextChange[]): string;
    function isValidLocationToAddComment(sourceFile: SourceFile, position: number): boolean;
}
declare namespace ts {
    interface CodeFixRegistration {
        errorCodes: number[];
        getCodeActions(context: CodeFixContext): CodeFixAction[] | undefined;
        fixIds?: string[];
        getAllCodeActions?(context: CodeFixAllContext): CombinedCodeActions;
    }
    interface CodeFixContextBase extends textChanges.TextChangesContext {
        sourceFile: SourceFile;
        program: Program;
        cancellationToken: CancellationToken;
        preferences: UserPreferences;
    }
    interface CodeFixAllContext extends CodeFixContextBase {
        fixId: {};
    }
    interface CodeFixContext extends CodeFixContextBase {
        errorCode: number;
        span: TextSpan;
    }
    namespace codefix {
        type DiagnosticAndArguments = DiagnosticMessage | [DiagnosticMessage, string] | [DiagnosticMessage, string, string];
        function createCodeFixActionNoFixId(fixName: string, changes: FileTextChanges[], description: DiagnosticAndArguments): CodeFixAction;
        function createCodeFixAction(fixName: string, changes: FileTextChanges[], description: DiagnosticAndArguments, fixId: {}, fixAllDescription: DiagnosticAndArguments, command?: CodeActionCommand): CodeFixAction;
        function registerCodeFix(reg: CodeFixRegistration): void;
        function getSupportedErrorCodes(): string[];
        function getFixes(context: CodeFixContext): CodeFixAction[];
        function getAllFixes(context: CodeFixAllContext): CombinedCodeActions;
        function createFileTextChanges(fileName: string, textChanges: TextChange[]): FileTextChanges;
        function codeFixAll(context: CodeFixAllContext, errorCodes: number[], use: (changes: textChanges.ChangeTracker, error: DiagnosticWithLocation, commands: Push<CodeActionCommand>) => void): CombinedCodeActions;
    }
}
declare namespace ts {
    interface Refactor {
        /** Compute the associated code actions */
        getEditsForAction(context: RefactorContext, actionName: string): RefactorEditInfo | undefined;
        /** Compute (quickly) which actions are available here */
        getAvailableActions(context: RefactorContext): ApplicableRefactorInfo[] | undefined;
    }
    interface RefactorContext extends textChanges.TextChangesContext {
        file: SourceFile;
        startPosition: number;
        endPosition?: number;
        program: Program;
        cancellationToken?: CancellationToken;
        preferences: UserPreferences;
    }
    namespace refactor {
        /** @param name An unique code associated with each refactor. Does not have to be human-readable. */
        function registerRefactor(name: string, refactor: Refactor): void;
        function getApplicableRefactors(context: RefactorContext): ApplicableRefactorInfo[];
        function getEditsForRefactor(context: RefactorContext, refactorName: string, actionName: string): RefactorEditInfo | undefined;
    }
    function getRefactorContextSpan({ startPosition, endPosition }: RefactorContext): TextSpan;
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
    type DeclarationWithType = FunctionLikeDeclaration | VariableDeclaration | PropertySignature | PropertyDeclaration;
    function parameterShouldGetTypeFromJSDoc(node: Node): node is DeclarationWithType;
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
    function getImportCompletionAction(exportedSymbol: Symbol, moduleSymbol: Symbol, sourceFile: SourceFile, symbolName: string, host: LanguageServiceHost, program: Program, checker: TypeChecker, compilerOptions: CompilerOptions, allSourceFiles: ReadonlyArray<SourceFile>, formatContext: formatting.FormatContext, getCanonicalFileName: GetCanonicalFileName, symbolToken: Node | undefined, preferences: UserPreferences): {
        readonly moduleSpecifier: string;
        readonly codeAction: CodeAction;
    };
    function forEachExternalModuleToImportFrom(checker: TypeChecker, from: SourceFile, allSourceFiles: ReadonlyArray<SourceFile>, cb: (module: Symbol) => void): void;
    function moduleSymbolToValidIdentifier(moduleSymbol: Symbol, target: ScriptTarget): string;
    function moduleSpecifierToValidIdentifier(moduleSpecifier: string, target: ScriptTarget): string;
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
    /**
     * Finds members of the resolved type that are missing in the class pointed to by class decl
     * and generates source code for the missing members.
     * @param possiblyMissingSymbols The collection of symbols to filter and then get insertions for.
     * @returns Empty string iff there are no member insertions.
     */
    function createMissingMemberNodes(classDeclaration: ClassLikeDeclaration, possiblyMissingSymbols: ReadonlyArray<Symbol>, checker: TypeChecker, preferences: UserPreferences, out: (node: ClassElement) => void): void;
    function createMethodFromCallExpression({ typeArguments, arguments: args, parent: parent }: CallExpression, methodName: string, inJs: boolean, makeStatic: boolean, preferences: UserPreferences): MethodDeclaration;
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.codefix {
}
declare namespace ts.refactor.generateGetAccessorAndSetAccessor {
}
declare namespace ts.refactor.extractSymbol {
    /**
     * Compute the associated code actions
     * Exported for tests.
     */
    function getAvailableActions(context: RefactorContext): ApplicableRefactorInfo[] | undefined;
    function getEditsForAction(context: RefactorContext, actionName: string): RefactorEditInfo | undefined;
    namespace Messages {
        const cannotExtractRange: DiagnosticMessage;
        const cannotExtractImport: DiagnosticMessage;
        const cannotExtractSuper: DiagnosticMessage;
        const cannotExtractEmpty: DiagnosticMessage;
        const expressionExpected: DiagnosticMessage;
        const uselessConstantType: DiagnosticMessage;
        const statementOrExpressionExpected: DiagnosticMessage;
        const cannotExtractRangeContainingConditionalBreakOrContinueStatements: DiagnosticMessage;
        const cannotExtractRangeContainingConditionalReturnStatement: DiagnosticMessage;
        const cannotExtractRangeContainingLabeledBreakOrContinueStatementWithTargetOutsideOfTheRange: DiagnosticMessage;
        const cannotExtractRangeThatContainsWritesToReferencesLocatedOutsideOfTheTargetRangeInGenerators: DiagnosticMessage;
        const typeWillNotBeVisibleInTheNewScope: DiagnosticMessage;
        const functionWillNotBeVisibleInTheNewScope: DiagnosticMessage;
        const cannotExtractIdentifier: DiagnosticMessage;
        const cannotExtractExportedEntity: DiagnosticMessage;
        const cannotWriteInExpression: DiagnosticMessage;
        const cannotExtractReadonlyPropertyInitializerOutsideConstructor: DiagnosticMessage;
        const cannotExtractAmbientBlock: DiagnosticMessage;
        const cannotAccessVariablesFromNestedScopes: DiagnosticMessage;
        const cannotExtractToOtherFunctionLike: DiagnosticMessage;
        const cannotExtractToJSClass: DiagnosticMessage;
        const cannotExtractToExpressionArrowFunction: DiagnosticMessage;
    }
    enum RangeFacts {
        None = 0,
        HasReturn = 1,
        IsGenerator = 2,
        IsAsyncFunction = 4,
        UsesThis = 8,
        /**
         * The range is in a function which needs the 'static' modifier in a class
         */
        InStaticRegion = 16
    }
    /**
     * Represents an expression or a list of statements that should be extracted with some extra information
     */
    interface TargetRange {
        readonly range: Expression | Statement[];
        readonly facts: RangeFacts;
        /**
         * A list of symbols that are declared in the selected range which are visible in the containing lexical scope
         * Used to ensure we don't turn something used outside the range free (or worse, resolve to a different entity).
         */
        readonly declarations: Symbol[];
    }
    /**
     * Result of 'getRangeToExtract' operation: contains either a range or a list of errors
     */
    type RangeToExtract = {
        readonly targetRange?: never;
        readonly errors: ReadonlyArray<Diagnostic>;
    } | {
        readonly targetRange: TargetRange;
        readonly errors?: never;
    };
    /**
     * getRangeToExtract takes a span inside a text file and returns either an expression or an array
     * of statements representing the minimum set of nodes needed to extract the entire span. This
     * process may fail, in which case a set of errors is returned instead (these are currently
     * not shown to the user, but can be used by us diagnostically)
     */
    function getRangeToExtract(sourceFile: SourceFile, span: TextSpan): RangeToExtract;
}
declare namespace ts.refactor.generateGetAccessorAndSetAccessor {
}
declare namespace ts.refactor {
}
declare namespace ts.refactor.addOrRemoveBracesToArrowFunction {
>>>>>>> a56b272d3891916a8debe36087fe7563bbade164
}
declare namespace ts {
    /** The version of the language service API */
    const servicesVersion = "0.8";
    function toEditorSettings(options: EditorOptions | EditorSettings): EditorSettings;
    function displayPartsToString(displayParts: SymbolDisplayPart[] | undefined): string;
    function getDefaultCompilerOptions(): CompilerOptions;
    function getSupportedCodeFixes(): string[];
    function createLanguageServiceSourceFile(fileName: string, scriptSnapshot: IScriptSnapshot, scriptTarget: ScriptTarget, version: string, setNodeParents: boolean, scriptKind?: ScriptKind): SourceFile;
    let disableIncrementalParsing: boolean;
    function updateLanguageServiceSourceFile(sourceFile: SourceFile, scriptSnapshot: IScriptSnapshot, version: string, textChangeRange: TextChangeRange | undefined, aggressiveChecks?: boolean): SourceFile;
<<<<<<< HEAD
=======
    /** A cancellation that throttles calls to the host */
    class ThrottledCancellationToken implements CancellationToken {
        private hostCancellationToken;
        private readonly throttleWaitMilliseconds;
        private lastCancellationCheckTime;
        constructor(hostCancellationToken: HostCancellationToken, throttleWaitMilliseconds?: number);
        isCancellationRequested(): boolean;
        throwIfCancellationRequested(): void;
    }
>>>>>>> a56b272d3891916a8debe36087fe7563bbade164
    function createLanguageService(host: LanguageServiceHost, documentRegistry?: DocumentRegistry, syntaxOnly?: boolean): LanguageService;
    /**
     * Get the path of the default library files (lib.d.ts) as distributed with the typescript
     * node package.
     * The functionality is not supported if the ts module is consumed outside of a node module.
     */
    function getDefaultLibFilePath(options: CompilerOptions): string;
}
declare namespace ts {
    /**
     * Transform one or more nodes using the supplied transformers.
     * @param source A single `Node` or an array of `Node` objects.
     * @param transformers An array of `TransformerFactory` callbacks used to process the transformation.
     * @param compilerOptions Optional compiler options.
     */
    function transform<T extends Node>(source: T | T[], transformers: TransformerFactory<T>[], compilerOptions?: CompilerOptions): TransformationResult<T>;
}
//# sourceMappingURL=typescriptServices.d.ts.map
export = ts