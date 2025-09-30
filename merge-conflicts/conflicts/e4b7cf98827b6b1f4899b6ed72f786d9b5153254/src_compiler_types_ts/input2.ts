module ts {
    export interface Map<T> {
        [index: string]: T;
    }

    export interface TextRange {
        pos: number;
        end: number;
    }

    // token > SyntaxKind.Identifer => token is a keyword
    export const enum SyntaxKind {
        Unknown,
        EndOfFileToken,
        SingleLineCommentTrivia,
        MultiLineCommentTrivia,
        NewLineTrivia,
        WhitespaceTrivia,
        // We detect and provide better error recovery when we encounter a git merge marker.  This
        // allows us to edit files with git-conflict markers in them in a much more pleasant manner.
        ConflictMarkerTrivia,
        // Literals
        NumericLiteral,
        StringLiteral,
        RegularExpressionLiteral,
        NoSubstitutionTemplateLiteral,
        // Pseudo-literals
        TemplateHead,
        TemplateMiddle,
        TemplateTail,
        // Punctuation
        OpenBraceToken,
        CloseBraceToken,
        OpenParenToken,
        CloseParenToken,
        OpenBracketToken,
        CloseBracketToken,
        DotToken,
        DotDotDotToken,
        SemicolonToken,
        CommaToken,
        LessThanToken,
        GreaterThanToken,
        LessThanEqualsToken,
        GreaterThanEqualsToken,
        EqualsEqualsToken,
        ExclamationEqualsToken,
        EqualsEqualsEqualsToken,
        ExclamationEqualsEqualsToken,
        EqualsGreaterThanToken,
        PlusToken,
        MinusToken,
        AsteriskToken,
        SlashToken,
        PercentToken,
        PlusPlusToken,
        MinusMinusToken,
        LessThanLessThanToken,
        GreaterThanGreaterThanToken,
        GreaterThanGreaterThanGreaterThanToken,
        AmpersandToken,
        BarToken,
        CaretToken,
        ExclamationToken,
        TildeToken,
        AmpersandAmpersandToken,
        BarBarToken,
        QuestionToken,
        ColonToken,
        AtToken,
        // Assignments
        EqualsToken,
        PlusEqualsToken,
        MinusEqualsToken,
        AsteriskEqualsToken,
        SlashEqualsToken,
        PercentEqualsToken,
        LessThanLessThanEqualsToken,
        GreaterThanGreaterThanEqualsToken,
        GreaterThanGreaterThanGreaterThanEqualsToken,
        AmpersandEqualsToken,
        BarEqualsToken,
        CaretEqualsToken,
        // Identifiers
        Identifier,
        // Reserved words
        BreakKeyword,
        CaseKeyword,
        CatchKeyword,
        ClassKeyword,
        ConstKeyword,
        ContinueKeyword,
        DebuggerKeyword,
        DefaultKeyword,
        DeleteKeyword,
        DoKeyword,
        ElseKeyword,
        EnumKeyword,
        ExportKeyword,
        ExtendsKeyword,
        FalseKeyword,
        FinallyKeyword,
        ForKeyword,
        FunctionKeyword,
        IfKeyword,
        ImportKeyword,
        InKeyword,
        InstanceOfKeyword,
        NewKeyword,
        NullKeyword,
        ReturnKeyword,
        SuperKeyword,
        SwitchKeyword,
        ThisKeyword,
        ThrowKeyword,
        TrueKeyword,
        TryKeyword,
        TypeOfKeyword,
        VarKeyword,
        VoidKeyword,
        WhileKeyword,
        WithKeyword,
        // Strict mode reserved words
        AsKeyword,
        ImplementsKeyword,
        InterfaceKeyword,
        LetKeyword,
        PackageKeyword,
        PrivateKeyword,
        ProtectedKeyword,
        PublicKeyword,
        StaticKeyword,
        YieldKeyword,
        // Contextual keywords
        AnyKeyword,
        BooleanKeyword,
        ConstructorKeyword,
        DeclareKeyword,
        GetKeyword,
        ModuleKeyword,
        RequireKeyword,
        NumberKeyword,
        SetKeyword,
        StringKeyword,
        SymbolKeyword,
        TypeKeyword,
        FromKeyword,
        OfKeyword, // LastKeyword and LastToken

        // Parse tree nodes

        // Names
        QualifiedName,
        ComputedPropertyName,
        // Signature elements
        TypeParameter,
        Parameter,
        Decorator,
        // TypeMember
        PropertySignature,
        PropertyDeclaration,
        MethodSignature,
        MethodDeclaration,
        Constructor,
        GetAccessor,
        SetAccessor,
        CallSignature,
        ConstructSignature,
        IndexSignature,
        // Type
        TypeReference,
        FunctionType,
        ConstructorType,
        TypeQuery,
        TypeLiteral,
        ArrayType,
        TupleType,
        UnionType,
        ParenthesizedType,
        // Binding patterns
        ObjectBindingPattern,
        ArrayBindingPattern,
        BindingElement,
        // Expression
        ArrayLiteralExpression,
        ObjectLiteralExpression,
        PropertyAccessExpression,
        ElementAccessExpression,
        CallExpression,
        NewExpression,
        TaggedTemplateExpression,
        TypeAssertionExpression,
        ParenthesizedExpression,
        FunctionExpression,
        ArrowFunction,
        DeleteExpression,
        TypeOfExpression,
        VoidExpression,
        PrefixUnaryExpression,
        PostfixUnaryExpression,
        BinaryExpression,
        ConditionalExpression,
        TemplateExpression,
        YieldExpression,
        SpreadElementExpression,
        ClassExpression,
        OmittedExpression,
        // Misc
        TemplateSpan,
        HeritageClauseElement,
        SemicolonClassElement,
        // Element
        Block,
        VariableStatement,
        EmptyStatement,
        ExpressionStatement,
        IfStatement,
        DoStatement,
        WhileStatement,
        ForStatement,
        ForInStatement,
        ForOfStatement,
        ContinueStatement,
        BreakStatement,
        ReturnStatement,
        WithStatement,
        SwitchStatement,
        LabeledStatement,
        ThrowStatement,
        TryStatement,
        DebuggerStatement,
        VariableDeclaration,
        VariableDeclarationList,
        FunctionDeclaration,
        ClassDeclaration,
        InterfaceDeclaration,
        TypeAliasDeclaration,
        EnumDeclaration,
        ModuleDeclaration,
        ModuleBlock,
        CaseBlock,
        ImportEqualsDeclaration,
        ImportDeclaration,
        ImportClause,
        NamespaceImport,
        NamedImports,
        ImportSpecifier,
        ExportAssignment,
        ExportDeclaration,
        NamedExports,
        ExportSpecifier,
        MissingDeclaration,

        // Module references
        ExternalModuleReference,

        // Clauses
        CaseClause,
        DefaultClause,
        HeritageClause,
        CatchClause,

        // Property assignments
        PropertyAssignment,
        ShorthandPropertyAssignment,

        // Enum
        EnumMember,
        // Top-level nodes
        SourceFile,

        // Synthesized list
        SyntaxList,
        // Enum value count
        Count,
        // Markers
        FirstAssignment = EqualsToken,
        LastAssignment = CaretEqualsToken,
        FirstReservedWord = BreakKeyword,
        LastReservedWord = WithKeyword,
        FirstKeyword = BreakKeyword,
        LastKeyword = OfKeyword,
        FirstFutureReservedWord = ImplementsKeyword,
        LastFutureReservedWord = YieldKeyword,
        FirstTypeNode = TypeReference,
        LastTypeNode = ParenthesizedType,
        FirstPunctuation = OpenBraceToken,
        LastPunctuation = CaretEqualsToken,
        FirstToken = Unknown,
        LastToken = LastKeyword,
        FirstTriviaToken = SingleLineCommentTrivia,
        LastTriviaToken = ConflictMarkerTrivia,
        FirstLiteralToken = NumericLiteral,
        LastLiteralToken = NoSubstitutionTemplateLiteral,
        FirstTemplateToken = NoSubstitutionTemplateLiteral,
        LastTemplateToken = TemplateTail,
        FirstBinaryOperator = LessThanToken,
        LastBinaryOperator = CaretEqualsToken,
        FirstNode = QualifiedName,
    }

    export const enum NodeFlags {
        Export =            0x00000001,  // Declarations
        Ambient =           0x00000002,  // Declarations
        Public =            0x00000010,  // Property/Method
        Private =           0x00000020,  // Property/Method
        Protected =         0x00000040,  // Property/Method
        Static =            0x00000080,  // Property/Method
        Default =           0x00000100,  // Function/Class (export default declaration)
        MultiLine =         0x00000200,  // Multi-line array or object literal
        Synthetic =         0x00000400,  // Synthetic node (for full fidelity)
        DeclarationFile =   0x00000800,  // Node is a .d.ts file
        Let =               0x00001000,  // Variable declaration
        Const =             0x00002000,  // Variable declaration
        OctalLiteral =      0x00004000,
        ExportContext =     0x00008000,  // Export context (initialized by binding)

        Modifier = Export | Ambient | Public | Private | Protected | Static | Default,
        AccessibilityModifier = Public | Private | Protected,
        BlockScoped = Let | Const
    }

    /* @internal */
    export const enum ParserContextFlags {
        // Set if this node was parsed in strict mode.  Used for grammar error checks, as well as
        // checking if the node can be reused in incremental settings.
        StrictMode = 1 << 0,

        // If this node was parsed in a context where 'in-expressions' are not allowed.
        DisallowIn = 1 << 1,

        // If this node was parsed in the 'yield' context created when parsing a generator.
        Yield = 1 << 2,

        // If this node was parsed in the parameters of a generator.
        GeneratorParameter = 1 << 3,

        // If this node was parsed as part of a decorator
        Decorator = 1 << 4,

        // If the parser encountered an error when parsing the code that created this node.  Note
        // the parser only sets this directly on the node it creates right after encountering the
        // error.
        ThisNodeHasError = 1 << 5,

        // Context flags set directly by the parser.
        ParserGeneratedFlags = StrictMode | DisallowIn | Yield | GeneratorParameter | Decorator | ThisNodeHasError,

        // Context flags computed by aggregating child flags upwards.

        // Used during incremental parsing to determine if this node or any of its children had an
        // error.  Computed only once and then cached.
        ThisNodeOrAnySubNodesHasError = 1 << 6,

        // Used to know if we've computed data from children and cached it in this node.
        HasAggregatedChildData = 1 << 7
    }

    /* @internal */
    export const enum RelationComparisonResult {
        Succeeded = 1, // Should be truthy
        Failed = 2,
        FailedAndReported = 3
    }

    export interface Node extends TextRange {
        kind: SyntaxKind;
        flags: NodeFlags;
        // Specific context the parser was in when this node was created.  Normally undefined.
        // Only set when the parser was in some interesting context (like async/yield).
        /* @internal */ parserContextFlags?: ParserContextFlags;
        decorators?: NodeArray<Decorator>;    // Array of decorators (in document order)
        modifiers?: ModifiersArray;           // Array of modifiers
        /* @internal */ id?: number;          // Unique id (used to look up NodeLinks)
        parent?: Node;                        // Parent node (initialized by binding)
        /* @internal */ symbol?: Symbol;      // Symbol declared by node (initialized by binding)
        /* @internal */ locals?: SymbolTable; // Locals associated with node (initialized by binding)
        /* @internal */ nextContainer?: Node; // Next container in declaration order (initialized by binding)
        /* @internal */ localSymbol?: Symbol; // Local symbol declared by node (initialized by binding only for exported nodes)
    }

    export interface NodeArray<T> extends Array<T>, TextRange {
        hasTrailingComma?: boolean;
    }

    export interface ModifiersArray extends NodeArray<Node> {
        flags: number;
    }

    export interface Identifier extends PrimaryExpression {
        text: string;                                  // Text of identifier (with escapes converted to characters)
        originalKeywordKind?: SyntaxKind;     // Original syntaxKind which get set so that we can report an error later
    }

    export interface QualifiedName extends Node {
        // Must have same layout as PropertyAccess
        left: EntityName;
        right: Identifier;
    }

    export type EntityName = Identifier | QualifiedName;

    export type DeclarationName = Identifier | LiteralExpression | ComputedPropertyName | BindingPattern;

    export interface Declaration extends Node {
        _declarationBrand: any;
        name?: DeclarationName;
    }

    export interface ComputedPropertyName extends Node {
        expression: Expression;
    }

    export interface Decorator extends Node {
        expression: LeftHandSideExpression;
    }

    export interface TypeParameterDeclaration extends Declaration {
        name: Identifier;
        constraint?: TypeNode;

        // For error recovery purposes.
        expression?: Expression;
    }

    export interface SignatureDeclaration extends Declaration {
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        parameters: NodeArray<ParameterDeclaration>;
        type?: TypeNode;
    }

    // SyntaxKind.VariableDeclaration
    export interface VariableDeclaration extends Declaration {
        parent?: VariableDeclarationList;
        name: Identifier | BindingPattern;  // Declared variable name
        type?: TypeNode;                    // Optional type annotation
        initializer?: Expression;           // Optional initializer
    }

    export interface VariableDeclarationList extends Node {
        declarations: NodeArray<VariableDeclaration>;
    }

    // SyntaxKind.Parameter
    export interface ParameterDeclaration extends Declaration {
        dotDotDotToken?: Node;              // Present on rest parameter
        name: Identifier | BindingPattern;  // Declared parameter name
        questionToken?: Node;               // Present on optional parameter
        type?: TypeNode;                    // Optional type annotation
        initializer?: Expression;           // Optional initializer
    }

    // SyntaxKind.BindingElement
    export interface BindingElement extends Declaration {
        propertyName?: Identifier;          // Binding property name (in object binding pattern)
        dotDotDotToken?: Node;              // Present on rest binding element
        name: Identifier | BindingPattern;  // Declared binding element name
        initializer?: Expression;           // Optional initializer
    }

    // SyntaxKind.Property
    export interface PropertyDeclaration extends Declaration, ClassElement {
        name: DeclarationName;              // Declared property name
        questionToken?: Node;               // Present on optional property
        type?: TypeNode;                    // Optional type annotation
        initializer?: Expression;           // Optional initializer
    }

    export interface ObjectLiteralElement extends Declaration {
        _objectLiteralBrandBrand: any;
    }

    // SyntaxKind.PropertyAssignment
    export interface PropertyAssignment extends ObjectLiteralElement {
        _propertyAssignmentBrand: any;
        name: DeclarationName;
        questionToken?: Node;
        initializer: Expression;
    }

    // SyntaxKind.ShorthandPropertyAssignment
    export interface ShorthandPropertyAssignment extends ObjectLiteralElement {
        name: Identifier;
        questionToken?: Node;
    }

    // SyntaxKind.VariableDeclaration
    // SyntaxKind.Parameter
    // SyntaxKind.BindingElement
    // SyntaxKind.Property
    // SyntaxKind.PropertyAssignment
    // SyntaxKind.ShorthandPropertyAssignment
    // SyntaxKind.EnumMember
    export interface VariableLikeDeclaration extends Declaration {
        propertyName?: Identifier;
        dotDotDotToken?: Node;
        name: DeclarationName;
        questionToken?: Node;
        type?: TypeNode;
        initializer?: Expression;
    }

    export interface BindingPattern extends Node {
        elements: NodeArray<BindingElement>;
    }

    /**
     * Several node kinds share function-like features such as a signature,
     * a name, and a body. These nodes should extend FunctionLikeDeclaration.
     * Examples:
     *  FunctionDeclaration
     *  MethodDeclaration
     *  AccessorDeclaration
     */
    export interface FunctionLikeDeclaration extends SignatureDeclaration {
        _functionLikeDeclarationBrand: any;

        asteriskToken?: Node;
        questionToken?: Node;
        body?: Block | Expression;
    }

    export interface FunctionDeclaration extends FunctionLikeDeclaration, Statement {
        name?: Identifier;
        body?: Block;
    }

    // Note that a MethodDeclaration is considered both a ClassElement and an ObjectLiteralElement.
    // Both the grammars for ClassDeclaration and ObjectLiteralExpression allow for MethodDeclarations
    // as child elements, and so a MethodDeclaration satisfies both interfaces.  This avoids the
    // alternative where we would need separate kinds/types for ClassMethodDeclaration and
    // ObjectLiteralMethodDeclaration, which would look identical.
    //
    // Because of this, it may be necessary to determine what sort of MethodDeclaration you have
    // at later stages of the compiler pipeline.  In that case, you can either check the parent kind
    // of the method, or use helpers like isObjectLiteralMethodDeclaration
    export interface MethodDeclaration extends FunctionLikeDeclaration, ClassElement, ObjectLiteralElement {
        body?: Block;
    }

    export interface ConstructorDeclaration extends FunctionLikeDeclaration, ClassElement {
        body?: Block;
    }

    // For when we encounter a semicolon in a class declaration.  ES6 allows these as class elements.
    export interface SemicolonClassElement extends ClassElement {
        _semicolonClassElementBrand: any;
    }

    // See the comment on MethodDeclaration for the intuition behind AccessorDeclaration being a
    // ClassElement and an ObjectLiteralElement.
    export interface AccessorDeclaration extends FunctionLikeDeclaration, ClassElement, ObjectLiteralElement {
        _accessorDeclarationBrand: any;
        body: Block;
    }

    export interface IndexSignatureDeclaration extends SignatureDeclaration, ClassElement {
        _indexSignatureDeclarationBrand: any;
    }

    export interface TypeNode extends Node {
        _typeNodeBrand: any;
    }

    export interface FunctionOrConstructorTypeNode extends TypeNode, SignatureDeclaration {
        _functionOrConstructorTypeNodeBrand: any;
    }

    export interface TypeReferenceNode extends TypeNode {
        typeName: EntityName;
        typeArguments?: NodeArray<TypeNode>;
    }

    export interface TypeQueryNode extends TypeNode {
        exprName: EntityName;
    }

    // A TypeLiteral is the declaration node for an anonymous symbol.
    export interface TypeLiteralNode extends TypeNode, Declaration {
        members: NodeArray<Node>;
    }

    export interface ArrayTypeNode extends TypeNode {
        elementType: TypeNode;
    }

    export interface TupleTypeNode extends TypeNode {
        elementTypes: NodeArray<TypeNode>;
    }

    export interface UnionTypeNode extends TypeNode {
        types: NodeArray<TypeNode>;
    }

    export interface ParenthesizedTypeNode extends TypeNode {
        type: TypeNode;
    }

    export interface StringLiteralTypeNode extends LiteralExpression, TypeNode { }

    // Note: 'brands' in our syntax nodes serve to give us a small amount of nominal typing.
    // Consider 'Expression'.  Without the brand, 'Expression' is actually no different
    // (structurally) than 'Node'.  Because of this you can pass any Node to a function that
    // takes an Expression without any error.  By using the 'brands' we ensure that the type
    // checker actually thinks you have something of the right type.  Note: the brands are
    // never actually given values.  At runtime they have zero cost.

    export interface Expression extends Node {
        _expressionBrand: any;
        contextualType?: Type;  // Used to temporarily assign a contextual type during overload resolution
    }

    export interface UnaryExpression extends Expression {
        _unaryExpressionBrand: any;
    }

    export interface PrefixUnaryExpression extends UnaryExpression {
        operator: SyntaxKind;
        operand: UnaryExpression;
    }

    export interface PostfixUnaryExpression extends PostfixExpression {
        operand: LeftHandSideExpression;
        operator: SyntaxKind;
    }

    export interface PostfixExpression extends UnaryExpression {
        _postfixExpressionBrand: any;
    }

    export interface LeftHandSideExpression extends PostfixExpression {
        _leftHandSideExpressionBrand: any;
    }

    export interface MemberExpression extends LeftHandSideExpression {
        _memberExpressionBrand: any;
    }

    export interface PrimaryExpression extends MemberExpression {
        _primaryExpressionBrand: any;
    }

    export interface DeleteExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    export interface TypeOfExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    export interface VoidExpression extends UnaryExpression {
        expression: UnaryExpression;
    }

    export interface YieldExpression extends Expression {
        asteriskToken?: Node;
        expression: Expression;
    }

    export interface BinaryExpression extends Expression {
        left: Expression;
        operatorToken: Node;
        right: Expression;
    }

    export interface ConditionalExpression extends Expression {
        condition: Expression;
        questionToken: Node;
        whenTrue: Expression;
        colonToken: Node;
        whenFalse: Expression;
    }

    export interface FunctionExpression extends PrimaryExpression, FunctionLikeDeclaration {
        name?: Identifier;
        body: Block | Expression;  // Required, whereas the member inherited from FunctionDeclaration is optional
    }

    export interface ArrowFunction extends Expression, FunctionLikeDeclaration {
        equalsGreaterThanToken: Node;
    }

    // The text property of a LiteralExpression stores the interpreted value of the literal in text form. For a StringLiteral,
    // or any literal of a template, this means quotes have been removed and escapes have been converted to actual characters.
    // For a NumericLiteral, the stored value is the toString() representation of the number. For example 1, 1.00, and 1e0 are all stored as just "1".
    export interface LiteralExpression extends PrimaryExpression {
        text: string;
        isUnterminated?: boolean;
        hasExtendedUnicodeEscape?: boolean;
    }

    export interface StringLiteralExpression extends LiteralExpression {
        _stringLiteralExpressionBrand: any;
    }

    export interface TemplateExpression extends PrimaryExpression {
        head: LiteralExpression;
        templateSpans: NodeArray<TemplateSpan>;
    }

    // Each of these corresponds to a substitution expression and a template literal, in that order.
    // The template literal must have kind TemplateMiddleLiteral or TemplateTailLiteral.
    export interface TemplateSpan extends Node {
        expression: Expression;
        literal: LiteralExpression;
    }

    export interface ParenthesizedExpression extends PrimaryExpression {
        expression: Expression;
    }

    export interface ArrayLiteralExpression extends PrimaryExpression {
        elements: NodeArray<Expression>;
    }

    export interface SpreadElementExpression extends Expression {
        expression: Expression;
    }

    // An ObjectLiteralExpression is the declaration node for an anonymous symbol.
    export interface ObjectLiteralExpression extends PrimaryExpression, Declaration {
        properties: NodeArray<ObjectLiteralElement>;
    }

    export interface PropertyAccessExpression extends MemberExpression {
        expression: LeftHandSideExpression;
        dotToken: Node;
        name: Identifier;
    }

    export interface ElementAccessExpression extends MemberExpression {
        expression: LeftHandSideExpression;
        argumentExpression?: Expression;
    }

    export interface CallExpression extends LeftHandSideExpression {
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments: NodeArray<Expression>;
    }

    export interface HeritageClauseElement extends Node {
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
    }

    export interface NewExpression extends CallExpression, PrimaryExpression { }

    export interface TaggedTemplateExpression extends MemberExpression {
        tag: LeftHandSideExpression;
        template: LiteralExpression | TemplateExpression;
    }

    export type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression;

    export interface TypeAssertion extends UnaryExpression {
        type: TypeNode;
        expression: UnaryExpression;
    }

    export interface Statement extends Node, ModuleElement {
        _statementBrand: any;
    }

    export interface Block extends Statement {
        statements: NodeArray<Statement>;
    }

    export interface VariableStatement extends Statement {
        declarationList: VariableDeclarationList;
    }

    export interface ExpressionStatement extends Statement {
        expression: Expression;
    }

    export interface IfStatement extends Statement {
        expression: Expression;
        thenStatement: Statement;
        elseStatement?: Statement;
    }

    export interface IterationStatement extends Statement {
        statement: Statement;
    }

    export interface DoStatement extends IterationStatement {
        expression: Expression;
    }

    export interface WhileStatement extends IterationStatement {
        expression: Expression;
    }

    export interface ForStatement extends IterationStatement {
        initializer?: VariableDeclarationList | Expression;
        condition?: Expression;
        iterator?: Expression;
    }

    export interface ForInStatement extends IterationStatement {
        initializer: VariableDeclarationList | Expression;
        expression: Expression;
    }

    export interface ForOfStatement extends IterationStatement {
        initializer: VariableDeclarationList | Expression;
        expression: Expression;
    }

    export interface BreakOrContinueStatement extends Statement {
        label?: Identifier;
    }

    export interface ReturnStatement extends Statement {
        expression?: Expression;
    }

    export interface WithStatement extends Statement {
        expression: Expression;
        statement: Statement;
    }

    export interface SwitchStatement extends Statement {
        expression: Expression;
        caseBlock: CaseBlock;
    }

    export interface CaseBlock extends Node {
        clauses: NodeArray<CaseOrDefaultClause>;
    }

    export interface CaseClause extends Node {
        expression?: Expression;
        statements: NodeArray<Statement>;
    }

    export interface DefaultClause extends Node {
        statements: NodeArray<Statement>;
    }

    export type CaseOrDefaultClause = CaseClause | DefaultClause;

    export interface LabeledStatement extends Statement {
        label: Identifier;
        statement: Statement;
    }

    export interface ThrowStatement extends Statement {
        expression: Expression;
    }

    export interface TryStatement extends Statement {
        tryBlock: Block;
        catchClause?: CatchClause;
        finallyBlock?: Block;
    }

    export interface CatchClause extends Node {
        variableDeclaration: VariableDeclaration;
        block: Block;
    }

    export interface ModuleElement extends Node {
        _moduleElementBrand: any;
    }

    export interface ClassLikeDeclaration extends Declaration {
        name?: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<ClassElement>;
    }

    export interface ClassDeclaration extends ClassLikeDeclaration, Statement {
    }

    export interface ClassExpression extends ClassLikeDeclaration, PrimaryExpression {
    }

    export interface ClassElement extends Declaration {
        _classElementBrand: any;
    }

    export interface InterfaceDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<Declaration>;
    }

    export interface HeritageClause extends Node {
        token: SyntaxKind;
        types?: NodeArray<HeritageClauseElement>;
    }

    export interface TypeAliasDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        type: TypeNode;
    }

    export interface EnumMember extends Declaration {
        // This does include ComputedPropertyName, but the parser will give an error
        // if it parses a ComputedPropertyName in an EnumMember
        name: DeclarationName;
        initializer?: Expression;
    }

    export interface EnumDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        members: NodeArray<EnumMember>;
    }

    export interface ModuleDeclaration extends Declaration, ModuleElement {
        name: Identifier | LiteralExpression;
        body: ModuleBlock | ModuleDeclaration;
    }

    export interface ModuleBlock extends Node, ModuleElement {
        statements: NodeArray<ModuleElement>
    }

    export interface ImportEqualsDeclaration extends Declaration, ModuleElement {
        name: Identifier;

        // 'EntityName' for an internal module reference, 'ExternalModuleReference' for an external
        // module reference.
        moduleReference: EntityName | ExternalModuleReference;
    }

    export interface ExternalModuleReference extends Node {
        expression?: Expression;
    }

    // In case of:
    // import "mod"  => importClause = undefined, moduleSpecifier = "mod"
    // In rest of the cases, module specifier is string literal corresponding to module
    // ImportClause information is shown at its declaration below.
    export interface ImportDeclaration extends ModuleElement {
        importClause?: ImportClause;
        moduleSpecifier: Expression;
    }

    // In case of:
    // import d from "mod" => name = d, namedBinding = undefined
    // import * as ns from "mod" => name = undefined, namedBinding: NamespaceImport = { name: ns }
    // import d, * as ns from "mod" => name = d, namedBinding: NamespaceImport = { name: ns }
    // import { a, b as x } from "mod" => name = undefined, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
    // import d, { a, b as x } from "mod" => name = d, namedBinding: NamedImports = { elements: [{ name: a }, { name: x, propertyName: b}]}
    export interface ImportClause extends Declaration {
        name?: Identifier; // Default binding
        namedBindings?: NamespaceImport | NamedImports;
    }

    export interface NamespaceImport extends Declaration {
        name: Identifier;
    }

    export interface ExportDeclaration extends Declaration, ModuleElement {
        exportClause?: NamedExports;
        moduleSpecifier?: Expression;
    }

    export interface NamedImportsOrExports extends Node {
        elements: NodeArray<ImportOrExportSpecifier>;
    }

    export type NamedImports = NamedImportsOrExports;
    export type NamedExports = NamedImportsOrExports;

    export interface ImportOrExportSpecifier extends Declaration {
        propertyName?: Identifier;  // Name preceding "as" keyword (or undefined when "as" is absent)
        name: Identifier;           // Declared name
    }

    export type ImportSpecifier = ImportOrExportSpecifier;
    export type ExportSpecifier = ImportOrExportSpecifier;

    export interface ExportAssignment extends Declaration, ModuleElement {
        isExportEquals?: boolean;
        expression: Expression;
    }

    export interface FileReference extends TextRange {
        fileName: string;
    }

    export interface CommentRange extends TextRange {
        hasTrailingNewLine?: boolean;
        kind: SyntaxKind;
    }

    // Source files are declarations when they are external modules.
    export interface SourceFile extends Declaration {
        statements: NodeArray<ModuleElement>;
        endOfFileToken: Node;

        fileName: string;
        text: string;

        amdDependencies: {path: string; name: string}[];
        amdModuleName: string;
        referencedFiles: FileReference[];

        hasNoDefaultLib: boolean;

        languageVersion: ScriptTarget;

        // The first node that causes this file to be an external module
        /* @internal */ externalModuleIndicator: Node;
        
        /* @internal */ identifiers: Map<string>;
        /* @internal */ nodeCount: number;
        /* @internal */ identifierCount: number;
        /* @internal */ symbolCount: number;

        // File level diagnostics reported by the parser (includes diagnostics about /// references
        // as well as code diagnostics).
        /* @internal */ parseDiagnostics: Diagnostic[];

        // File level diagnostics reported by the binder.
        /* @internal */ bindDiagnostics: Diagnostic[];

        // Stores a line map for the file.
        // This field should never be used directly to obtain line map, use getLineMap function instead.
        /* @internal */ lineMap: number[];
    }

    export interface ScriptReferenceHost {
        getCompilerOptions(): CompilerOptions;
        getSourceFile(fileName: string): SourceFile;
        getCurrentDirectory(): string;
    }

    export interface WriteFileCallback {
        (fileName: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
    }

    export interface Program extends ScriptReferenceHost {
        /**
         * Get a list of files in the program
         */
        getSourceFiles(): SourceFile[];

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
        emit(targetSourceFile?: SourceFile, writeFile?: WriteFileCallback): EmitResult;

        getSyntacticDiagnostics(sourceFile?: SourceFile): Diagnostic[];
        getGlobalDiagnostics(): Diagnostic[];
        getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[];
        getDeclarationDiagnostics(sourceFile?: SourceFile): Diagnostic[];

        /** 
         * Gets a type checker that can be used to semantically analyze source fils in the program.
         */
        getTypeChecker(): TypeChecker;

        /* @internal */ getCommonSourceDirectory(): string;

        // For testing purposes only.  Should not be used by any other consumers (including the
        // language service).
        /* @internal */ getDiagnosticsProducingTypeChecker(): TypeChecker;

        /* @internal */ getNodeCount(): number;
        /* @internal */ getIdentifierCount(): number;
        /* @internal */ getSymbolCount(): number;
        /* @internal */ getTypeCount(): number;
    }

    export interface SourceMapSpan {
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

    export interface SourceMapData {
        sourceMapFilePath: string;       // Where the sourcemap file is written
        jsSourceMappingURL: string;      // source map URL written in the .js file
        sourceMapFile: string;           // Source map's file field - .js file name
        sourceMapSourceRoot: string;     // Source map's sourceRoot field - location where the sources will be present if not ""
        sourceMapSources: string[];      // Source map's sources field - list of sources that can be indexed in this source map
        inputSourceFileNames: string[];  // Input source file (which one can use on program to get the file), 1:1 mapping with the sourceMapSources list
        sourceMapNames?: string[];       // Source map's names field - list of names that can be indexed in this source map
        sourceMapMappings: string;       // Source map's mapping field - encoded source map spans
        sourceMapDecodedMappings: SourceMapSpan[];  // Raw source map spans that were encoded into the sourceMapMappings
    }

    /** Return code used by getEmitOutput function to indicate status of the function */
    export enum ExitStatus {
        // Compiler ran successfully.  Either this was a simple do-nothing compilation (for example,
        // when -version or -help was provided, or this was a normal compilation, no diagnostics
        // were produced, and all outputs were generated successfully.
        Success = 0,

        // Diagnostics were produced and because of them no code was generated.
        DiagnosticsPresent_OutputsSkipped = 1,

        // Diagnostics were produced and outputs were generated in spite of them.
        DiagnosticsPresent_OutputsGenerated = 2,
    }

    export interface EmitResult {
        emitSkipped: boolean;
        diagnostics: Diagnostic[];
        /* @internal */ sourceMaps: SourceMapData[];  // Array of sourceMapData if compiler emitted sourcemaps
    }

    export interface TypeCheckerHost {
        getCompilerOptions(): CompilerOptions;

        getSourceFiles(): SourceFile[];
        getSourceFile(fileName: string): SourceFile;
    }

    export interface TypeChecker {
        getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
        getDeclaredTypeOfSymbol(symbol: Symbol): Type;
        getPropertiesOfType(type: Type): Symbol[];
        getPropertyOfType(type: Type, propertyName: string): Symbol;
        getSignaturesOfType(type: Type, kind: SignatureKind): Signature[];
        getIndexTypeOfType(type: Type, kind: IndexKind): Type;
        getReturnTypeOfSignature(signature: Signature): Type;

        getSymbolsInScope(location: Node, meaning: SymbolFlags): Symbol[];
        getSymbolAtLocation(node: Node): Symbol;
        getShorthandAssignmentValueSymbol(location: Node): Symbol;
        getTypeAtLocation(node: Node): Type;
        typeToString(type: Type, enclosingDeclaration?: Node, flags?: TypeFormatFlags): string;
        symbolToString(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags): string;
        getSymbolDisplayBuilder(): SymbolDisplayBuilder;
        getFullyQualifiedName(symbol: Symbol): string;
        getAugmentedPropertiesOfType(type: Type): Symbol[];
        getRootSymbols(symbol: Symbol): Symbol[];
        getContextualType(node: Expression): Type;
        getResolvedSignature(node: CallLikeExpression, candidatesOutArray?: Signature[]): Signature;
        getSignatureFromDeclaration(declaration: SignatureDeclaration): Signature;
        isImplementationOfOverload(node: FunctionLikeDeclaration): boolean;
        isUndefinedSymbol(symbol: Symbol): boolean;
        isArgumentsSymbol(symbol: Symbol): boolean;

        getConstantValue(node: EnumMember | PropertyAccessExpression | ElementAccessExpression): number;
        isValidPropertyAccess(node: PropertyAccessExpression | QualifiedName, propertyName: string): boolean;
        getAliasedSymbol(symbol: Symbol): Symbol;
        getExportsOfModule(moduleSymbol: Symbol): Symbol[];

        // Should not be called directly.  Should only be accessed through the Program instance.
        /* @internal */ getDiagnostics(sourceFile?: SourceFile): Diagnostic[];
        /* @internal */ getGlobalDiagnostics(): Diagnostic[];
        /* @internal */ getEmitResolver(sourceFile?: SourceFile): EmitResolver;

        /* @internal */ getNodeCount(): number;
        /* @internal */ getIdentifierCount(): number;
        /* @internal */ getSymbolCount(): number;
        /* @internal */ getTypeCount(): number;
    }

    export interface SymbolDisplayBuilder {
        buildTypeDisplay(type: Type, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildSymbolDisplay(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, meaning?: SymbolFlags, flags?: SymbolFormatFlags): void;
        buildSignatureDisplay(signatures: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildParameterDisplay(parameter: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplay(tp: TypeParameter, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplayFromSymbol(symbol: Symbol, writer: SymbolWriter, enclosingDeclaraiton?: Node, flags?: TypeFormatFlags): void;
        buildDisplayForParametersAndDelimiters(parameters: Symbol[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildDisplayForTypeParametersAndDelimiters(typeParameters: TypeParameter[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildReturnTypeDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
    }

    export interface SymbolWriter {
        writeKeyword(text: string): void;
        writeOperator(text: string): void;
        writePunctuation(text: string): void;
        writeSpace(text: string): void;
        writeStringLiteral(text: string): void;
        writeParameter(text: string): void;
        writeSymbol(text: string, symbol: Symbol): void;
        writeLine(): void;
        increaseIndent(): void;
        decreaseIndent(): void;
        clear(): void;

        // Called when the symbol writer encounters a symbol to write.  Currently only used by the
        // declaration emitter to help determine if it should patch up the final declaration file
        // with import statements it previously saw (but chose not to emit).
        trackSymbol(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags): void;
    }

    export const enum TypeFormatFlags {
        None                            = 0x00000000,
        WriteArrayAsGenericType         = 0x00000001,  // Write Array<T> instead T[]
        UseTypeOfFunction               = 0x00000002,  // Write typeof instead of function type literal
        NoTruncation                    = 0x00000004,  // Don't truncate typeToString result
        WriteArrowStyleSignature        = 0x00000008,  // Write arrow style signature
        WriteOwnNameForAnyLike          = 0x00000010,  // Write symbol's own name instead of 'any' for any like types (eg. unknown, __resolving__ etc)
        WriteTypeArgumentsOfSignature   = 0x00000020,  // Write the type arguments instead of type parameters of the signature
        InElementType                   = 0x00000040,  // Writing an array or union element type
        UseFullyQualifiedType           = 0x00000080,  // Write out the fully qualified type name (eg. Module.Type, instead of Type)
    }

    export const enum SymbolFormatFlags {
        None = 0x00000000,

        // Write symbols's type argument if it is instantiated symbol
        // eg. class C<T> { p: T }   <-- Show p as C<T>.p here
        //     var a: C<number>;
        //     var p = a.p;  <--- Here p is property of C<number> so show it as C<number>.p instead of just C.p
        WriteTypeParametersOrArguments = 0x00000001,

        // Use only external alias information to get the symbol name in the given context
        // eg.  module m { export class c { } } import x = m.c;
        // When this flag is specified m.c will be used to refer to the class instead of alias symbol x
        UseOnlyExternalAliasing = 0x00000002,
    }

    /* @internal */
    export const enum SymbolAccessibility {
        Accessible,
        NotAccessible,
        CannotBeNamed
    }

    /* @internal */
    export type AnyImportSyntax = ImportDeclaration | ImportEqualsDeclaration;

    /* @internal */
    export interface SymbolVisibilityResult {
        accessibility: SymbolAccessibility;
        aliasesToMakeVisible?: AnyImportSyntax[]; // aliases that need to have this symbol visible
        errorSymbolName?: string; // Optional symbol name that results in error
        errorNode?: Node; // optional node that results in error
    }

    /* @internal */
    export interface SymbolAccessiblityResult extends SymbolVisibilityResult {
        errorModuleName?: string // If the symbol is not visible from module, module's name
    }

    /* @internal */
    export interface EmitResolver {
        hasGlobalName(name: string): boolean;
        getExpressionNameSubstitution(node: Identifier, getGeneratedNameForNode: (node: Node) => string): string;
        isValueAliasDeclaration(node: Node): boolean;
        isReferencedAliasDeclaration(node: Node, checkChildren?: boolean): boolean;
        isTopLevelValueImportEqualsWithEntityName(node: ImportEqualsDeclaration): boolean;
        getNodeCheckFlags(node: Node): NodeCheckFlags;
        isDeclarationVisible(node: Declaration): boolean;
        collectLinkedAliases(node: Identifier): Node[];
        isImplementationOfOverload(node: FunctionLikeDeclaration): boolean;
        writeTypeOfDeclaration(declaration: AccessorDeclaration | VariableLikeDeclaration, enclosingDeclaration: Node, flags: TypeFormatFlags, writer: SymbolWriter): void;
        writeReturnTypeOfSignatureDeclaration(signatureDeclaration: SignatureDeclaration, enclosingDeclaration: Node, flags: TypeFormatFlags, writer: SymbolWriter): void;
        writeTypeOfExpression(expr: Expression, enclosingDeclaration: Node, flags: TypeFormatFlags, writer: SymbolWriter): void;
        isSymbolAccessible(symbol: Symbol, enclosingDeclaration: Node, meaning: SymbolFlags): SymbolAccessiblityResult;
        isEntityNameVisible(entityName: EntityName | Expression, enclosingDeclaration: Node): SymbolVisibilityResult;
        // Returns the constant value this property access resolves to, or 'undefined' for a non-constant
        getConstantValue(node: EnumMember | PropertyAccessExpression | ElementAccessExpression): number;
        resolvesToSomeValue(location: Node, name: string): boolean;
        getBlockScopedVariableId(node: Identifier): number;
        serializeTypeOfNode(node: Node, getGeneratedNameForNode: (Node: Node) => string): string | string[];
        serializeParameterTypesOfNode(node: Node, getGeneratedNameForNode: (Node: Node) => string): (string | string[])[];
        serializeReturnTypeOfNode(node: Node, getGeneratedNameForNode: (Node: Node) => string): string | string[];
    }

    export const enum SymbolFlags {
        FunctionScopedVariable  = 0x00000001,  // Variable (var) or parameter
        BlockScopedVariable     = 0x00000002,  // A block-scoped variable (let or const)
        Property                = 0x00000004,  // Property or enum member
        EnumMember              = 0x00000008,  // Enum member
        Function                = 0x00000010,  // Function
        Class                   = 0x00000020,  // Class
        Interface               = 0x00000040,  // Interface
        ConstEnum               = 0x00000080,  // Const enum
        RegularEnum             = 0x00000100,  // Enum
        ValueModule             = 0x00000200,  // Instantiated module
        NamespaceModule         = 0x00000400,  // Uninstantiated module
        TypeLiteral             = 0x00000800,  // Type Literal
        ObjectLiteral           = 0x00001000,  // Object Literal
        Method                  = 0x00002000,  // Method
        Constructor             = 0x00004000,  // Constructor
        GetAccessor             = 0x00008000,  // Get accessor
        SetAccessor             = 0x00010000,  // Set accessor
        Signature               = 0x00020000,  // Call, construct, or index signature
        TypeParameter           = 0x00040000,  // Type parameter
        TypeAlias               = 0x00080000,  // Type alias
        ExportValue             = 0x00100000,  // Exported value marker (see comment in declareModuleMember in binder)
        ExportType              = 0x00200000,  // Exported type marker (see comment in declareModuleMember in binder)
        ExportNamespace         = 0x00400000,  // Exported namespace marker (see comment in declareModuleMember in binder)
        Alias                   = 0x00800000,  // An alias for another symbol (see comment in isAliasSymbolDeclaration in checker)
        Instantiated            = 0x01000000,  // Instantiated symbol
        Merged                  = 0x02000000,  // Merged symbol (created during program binding)
        Transient               = 0x04000000,  // Transient symbol (created during type check)
        Prototype               = 0x08000000,  // Prototype property (no source representation)
        UnionProperty           = 0x10000000,  // Property in union type
        Optional                = 0x20000000,  // Optional property
        ExportStar              = 0x40000000,  // Export * declaration

        Enum = RegularEnum | ConstEnum,
        Variable = FunctionScopedVariable | BlockScopedVariable,
        Value = Variable | Property | EnumMember | Function | Class | Enum | ValueModule | Method | GetAccessor | SetAccessor,
        Type = Class | Interface | Enum | TypeLiteral | ObjectLiteral | TypeParameter | TypeAlias,
        Namespace = ValueModule | NamespaceModule,
        Module = ValueModule | NamespaceModule,
        Accessor = GetAccessor | SetAccessor,

        // Variables can be redeclared, but can not redeclare a block-scoped declaration with the
        // same name, or any other value that is not a variable, e.g. ValueModule or Class
        FunctionScopedVariableExcludes = Value & ~FunctionScopedVariable,

        // Block-scoped declarations are not allowed to be re-declared
        // they can not merge with anything in the value space
        BlockScopedVariableExcludes = Value,

        ParameterExcludes = Value,
        PropertyExcludes = Value,
        EnumMemberExcludes = Value,
        FunctionExcludes = Value & ~(Function | ValueModule),
        ClassExcludes = (Value | Type) & ~ValueModule,
        InterfaceExcludes = Type & ~Interface,
        RegularEnumExcludes = (Value | Type) & ~(RegularEnum | ValueModule), // regular enums merge only with regular enums and modules
        ConstEnumExcludes = (Value | Type) & ~ConstEnum, // const enums merge only with const enums
        ValueModuleExcludes = Value & ~(Function | Class | RegularEnum | ValueModule),
        NamespaceModuleExcludes = 0,
        MethodExcludes = Value & ~Method,
        GetAccessorExcludes = Value & ~SetAccessor,
        SetAccessorExcludes = Value & ~GetAccessor,
        TypeParameterExcludes = Type & ~TypeParameter,
        TypeAliasExcludes = Type,
        AliasExcludes = Alias,

        ModuleMember = Variable | Function | Class | Interface | Enum | Module | TypeAlias | Alias,

        ExportHasLocal = Function | Class | Enum | ValueModule,

        HasLocals = Function | Module | Method | Constructor | Accessor | Signature,
        HasExports = Class | Enum | Module,
        HasMembers = Class | Interface | TypeLiteral | ObjectLiteral,

        IsContainer = HasLocals | HasExports | HasMembers,
        PropertyOrAccessor = Property | Accessor,
        Export = ExportNamespace | ExportType | ExportValue,
    }

    export interface Symbol {
        flags: SymbolFlags;                     // Symbol flags
        name: string;                           // Name of symbol
        /* @internal */ id?: number;            // Unique id (used to look up SymbolLinks)
        /* @internal */ mergeId?: number;       // Merge id (used to look up merged symbol)
        declarations?: Declaration[];           // Declarations associated with this symbol
        /* @internal */ parent?: Symbol;        // Parent symbol
        members?: SymbolTable;                  // Class, interface or literal instance members
        exports?: SymbolTable;                  // Module exports
        /* @internal */ exportSymbol?: Symbol;  // Exported symbol associated with this symbol
        valueDeclaration?: Declaration;         // First value declaration of the symbol
        /* @internal */ constEnumOnlyModule?: boolean; // True if module contains only const enums or other modules with only const enums
    }

    /* @internal */ 
    export interface SymbolLinks {
        target?: Symbol;                    // Resolved (non-alias) target of an alias
        type?: Type;                        // Type of value symbol
        declaredType?: Type;                // Type of class, interface, enum, or type parameter
        mapper?: TypeMapper;                // Type mapper for instantiation alias
        referenced?: boolean;               // True if alias symbol has been referenced as a value
        unionType?: UnionType;              // Containing union type for union property
        resolvedExports?: SymbolTable;      // Resolved exports of module
        exportsChecked?: boolean;           // True if exports of external module have been checked
    }

    /* @internal */ 
    export interface TransientSymbol extends Symbol, SymbolLinks { }

    export interface SymbolTable {
        [index: string]: Symbol;
    }

    /* @internal */ 
    export const enum NodeCheckFlags {
        TypeChecked                 = 0x00000001,  // Node has been type checked
        LexicalThis                 = 0x00000002,  // Lexical 'this' reference
        CaptureThis                 = 0x00000004,  // Lexical 'this' used in body
        EmitExtends                 = 0x00000008,  // Emit __extends
        SuperInstance               = 0x00000010,  // Instance 'super' reference
        SuperStatic                 = 0x00000020,  // Static 'super' reference
        ContextChecked              = 0x00000040,  // Contextual types have been assigned

        // Values for enum members have been computed, and any errors have been reported for them.
        EnumValuesComputed          = 0x00000080,
        BlockScopedBindingInLoop    = 0x00000100,
        EmitDecorate                = 0x00000200,  // Emit __decorate
        EmitParam                   = 0x00000400,  // Emit __param helper for decorators
    }

    /* @internal */ 
    export interface NodeLinks {
        resolvedType?: Type;              // Cached type of type node
        resolvedSignature?: Signature;    // Cached signature of signature node or call expression
        resolvedSymbol?: Symbol;          // Cached name resolution result
        flags?: NodeCheckFlags;           // Set of flags specific to Node
        enumMemberValue?: number;         // Constant value of enum member
        isIllegalTypeReferenceInConstraint?: boolean; // Is type reference in constraint refers to the type parameter from the same list
        isVisible?: boolean;              // Is this node visible
        generatedName?: string;           // Generated name for module, enum, or import declaration
        generatedNames?: Map<string>;     // Generated names table for source file
        assignmentChecks?: Map<boolean>;  // Cache of assignment checks
        hasReportedStatementInAmbientContext?: boolean;  // Cache boolean if we report statements in ambient context
        importOnRightSide?: Symbol;       // for import declarations - import that appear on the right side
    }

    export const enum TypeFlags {
        Any                     = 0x00000001,
        String                  = 0x00000002,
        Number                  = 0x00000004,
        Boolean                 = 0x00000008,
        Void                    = 0x00000010,
        Undefined               = 0x00000020,
        Null                    = 0x00000040,
        Enum                    = 0x00000080,  // Enum type
        StringLiteral           = 0x00000100,  // String literal type
        TypeParameter           = 0x00000200,  // Type parameter
        Class                   = 0x00000400,  // Class
        Interface               = 0x00000800,  // Interface
        Reference               = 0x00001000,  // Generic type reference
        Tuple                   = 0x00002000,  // Tuple
        Union                   = 0x00004000,  // Union
        Anonymous               = 0x00008000,  // Anonymous
        /* @internal */ 
        FromSignature           = 0x00010000,  // Created for signature assignment check
        ObjectLiteral           = 0x00020000,  // Originates in an object literal
        /* @internal */ 
        ContainsUndefinedOrNull = 0x00040000,  // Type is or contains Undefined or Null type
        /* @internal */ 
        ContainsObjectLiteral = 0x00080000,  // Type is or contains object literal type
        ESSymbol                = 0x00100000,  // Type of symbol primitive introduced in ES6

        /* @internal */ 
        Intrinsic = Any | String | Number | Boolean | ESSymbol | Void | Undefined | Null,
        /* @internal */ 
        Primitive = String | Number | Boolean | ESSymbol | Void | Undefined | Null | StringLiteral | Enum,
        StringLike = String | StringLiteral,
        NumberLike = Number | Enum,
        ObjectType = Class | Interface | Reference | Tuple | Anonymous,
        /* @internal */ 
        RequiresWidening = ContainsUndefinedOrNull | ContainsObjectLiteral
    }

    // Properties common to all types
    export interface Type {
        flags: TypeFlags;               // Flags
        /* @internal */ id: number;     // Unique ID
        symbol?: Symbol;                // Symbol associated with type (if any)
    }

    /* @internal */ 
    // Intrinsic types (TypeFlags.Intrinsic)
    export interface IntrinsicType extends Type {
        intrinsicName: string;  // Name of intrinsic type
    }

    // String literal types (TypeFlags.StringLiteral)
    export interface StringLiteralType extends Type {
        text: string;  // Text of string literal
    }

    // Object types (TypeFlags.ObjectType)
    export interface ObjectType extends Type { }

    // Class and interface types (TypeFlags.Class and TypeFlags.Interface)
    export interface InterfaceType extends ObjectType {
        typeParameters: TypeParameter[];           // Type parameters (undefined if non-generic)
        baseTypes: ObjectType[];                   // Base types
        declaredProperties: Symbol[];              // Declared members
        declaredCallSignatures: Signature[];       // Declared call signatures
        declaredConstructSignatures: Signature[];  // Declared construct signatures
        declaredStringIndexType: Type;             // Declared string index type
        declaredNumberIndexType: Type;             // Declared numeric index type
    }

    // Type references (TypeFlags.Reference)
    export interface TypeReference extends ObjectType {
        target: GenericType;    // Type reference target
        typeArguments: Type[];  // Type reference type arguments
    }

    // Generic class and interface types
    export interface GenericType extends InterfaceType, TypeReference {
        /* @internal */
        instantiations: Map<TypeReference>;   // Generic instantiation cache
    }

    export interface TupleType extends ObjectType {
        elementTypes: Type[];          // Element types
        baseArrayType: TypeReference;  // Array<T> where T is best common type of element types
    }

    export interface UnionType extends Type {
        types: Type[];                    // Constituent types
        /* @internal */
        resolvedProperties: SymbolTable;  // Cache of resolved properties
    }

    /* @internal */
    // Resolved object or union type
    export interface ResolvedType extends ObjectType, UnionType {
        members: SymbolTable;              // Properties by name
        properties: Symbol[];              // Properties
        callSignatures: Signature[];       // Call signatures of type
        constructSignatures: Signature[];  // Construct signatures of type
        stringIndexType: Type;             // String index type
        numberIndexType: Type;             // Numeric index type
    }

    // Type parameters (TypeFlags.TypeParameter)
    export interface TypeParameter extends Type {
        constraint: Type;        // Constraint
        /* @internal */
        target?: TypeParameter;  // Instantiation target
        /* @internal */
        mapper?: TypeMapper;     // Instantiation mapper
    }

    export const enum SignatureKind {
        Call,
        Construct,
    }

    export interface Signature {
        declaration: SignatureDeclaration;  // Originating declaration
        typeParameters: TypeParameter[];    // Type parameters (undefined if non-generic)
        parameters: Symbol[];               // Parameters
        /* @internal */
        resolvedReturnType: Type;           // Resolved return type
        /* @internal */
        minArgumentCount: number;           // Number of non-optional parameters
        /* @internal */
        hasRestParameter: boolean;          // True if last parameter is rest parameter
        /* @internal */
        hasStringLiterals: boolean;         // True if specialized
        /* @internal */
        target?: Signature;                 // Instantiation target
        /* @internal */
        mapper?: TypeMapper;                // Instantiation mapper
        /* @internal */
        unionSignatures?: Signature[];      // Underlying signatures of a union signature
        /* @internal */
        erasedSignatureCache?: Signature;   // Erased version of signature (deferred)
        /* @internal */
        isolatedSignatureType?: ObjectType; // A manufactured type that just contains the signature for purposes of signature comparison
    }

    export const enum IndexKind {
        String,
        Number,
    }

    /* @internal */
    export interface TypeMapper {
        (t: Type): Type;
    }

    /* @internal */
    export interface TypeInferences {
        primary: Type[];    // Inferences made directly to a type parameter
        secondary: Type[];  // Inferences made to a type parameter in a union type
        isFixed: boolean;   // Whether the type parameter is fixed, as defined in section 4.12.2 of the TypeScript spec
                            // If a type parameter is fixed, no more inferences can be made for the type parameter
    }

    /* @internal */
    export interface InferenceContext {
        typeParameters: TypeParameter[];    // Type parameters for which inferences are made
        inferUnionTypes: boolean;           // Infer union types for disjoint candidates (otherwise undefinedType)
        inferences: TypeInferences[];       // Inferences made for each type parameter
        inferredTypes: Type[];              // Inferred type for each type parameter
        failedTypeParameterIndex?: number;  // Index of type parameter for which inference failed
        // It is optional because in contextual signature instantiation, nothing fails
    }

    export interface DiagnosticMessage {
        key: string;
        category: DiagnosticCategory;
        code: number;
    }

    /**
     * A linked list of formatted diagnostic messages to be used as part of a multiline message.
     * It is built from the bottom up, leaving the head to be the "main" diagnostic.
     * While it seems that DiagnosticMessageChain is structurally similar to DiagnosticMessage,
     * the difference is that messages are all preformatted in DMC.
     */
    export interface DiagnosticMessageChain {
        messageText: string;
        category: DiagnosticCategory;
        code: number;
        next?: DiagnosticMessageChain;
    }

    export interface Diagnostic {
        file: SourceFile;
        start: number;
        length: number;
        messageText: string | DiagnosticMessageChain;
        category: DiagnosticCategory;
        code: number;
    }

    export enum DiagnosticCategory {
        Warning,
        Error,
        Message,
    }

    export interface CompilerOptions {
        allowNonTsExtensions?: boolean;
        charset?: string;
        declaration?: boolean;
        diagnostics?: boolean;
        emitBOM?: boolean;
        help?: boolean;
        listFiles?: boolean;
        locale?: string;
        mapRoot?: string;
        module?: ModuleKind;
        noEmit?: boolean;
        noEmitOnError?: boolean;
        noErrorTruncation?: boolean;
        noImplicitAny?: boolean;
        noLib?: boolean;
        noResolve?: boolean;
        out?: string;
        outDir?: string;
        preserveConstEnums?: boolean;
        project?: string;
        removeComments?: boolean;
        sourceMap?: boolean;
        sourceRoot?: string;
        suppressImplicitAnyIndexErrors?: boolean;
        target?: ScriptTarget;
        version?: boolean;
        watch?: boolean;
        separateCompilation?: boolean;
        emitDecoratorMetadata?: boolean;
        /* @internal */ stripInternal?: boolean;
        [option: string]: string | number | boolean;
    }

    export const enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
    }

    export interface LineAndCharacter {
        line: number;
        /*
         * This value denotes the character position in line and is different from the 'column' because of tab characters.
         */
        character: number;
    }

    export const enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES6 = 2,
        Latest = ES6,
    }

    export interface ParsedCommandLine {
        options: CompilerOptions;
        fileNames: string[];
        errors: Diagnostic[];
    }

    /* @internal */
    export interface CommandLineOption {
        name: string;
        type: string | Map<number>;         // "string", "number", "boolean", or an object literal mapping named values to actual values
        isFilePath?: boolean;               // True if option value is a path or fileName
        shortName?: string;                 // A short mnemonic for convenience - for instance, 'h' can be used in place of 'help'
        description?: DiagnosticMessage;    // The message describing what the command line switch does
        paramType?: DiagnosticMessage;      // The name to be used for a non-boolean option's parameter
        error?: DiagnosticMessage;          // The error given when the argument does not fit a customized 'type'
        experimental?: boolean;
    }

    /* @internal */
    export const enum CharacterCodes {
        nullCharacter = 0,
        maxAsciiCharacter = 0x7F,

        lineFeed = 0x0A,              // \n
        carriageReturn = 0x0D,        // \r
        lineSeparator = 0x2028,
        paragraphSeparator = 0x2029,
        nextLine = 0x0085,

        // Unicode 3.0 space characters
        space = 0x0020,   // " "
        nonBreakingSpace = 0x00A0,   //
        enQuad = 0x2000,
        emQuad = 0x2001,
        enSpace = 0x2002,
        emSpace = 0x2003,
        threePerEmSpace = 0x2004,
        fourPerEmSpace = 0x2005,
        sixPerEmSpace = 0x2006,
        figureSpace = 0x2007,
        punctuationSpace = 0x2008,
        thinSpace = 0x2009,
        hairSpace = 0x200A,
        zeroWidthSpace = 0x200B,
        narrowNoBreakSpace = 0x202F,
        ideographicSpace = 0x3000,
        mathematicalSpace = 0x205F,
        ogham = 0x1680,

        _ = 0x5F,
        $ = 0x24,

        _0 = 0x30,
        _1 = 0x31,
        _2 = 0x32,
        _3 = 0x33,
        _4 = 0x34,
        _5 = 0x35,
        _6 = 0x36,
        _7 = 0x37,
        _8 = 0x38,
        _9 = 0x39,

        a = 0x61,
        b = 0x62,
        c = 0x63,
        d = 0x64,
        e = 0x65,
        f = 0x66,
        g = 0x67,
        h = 0x68,
        i = 0x69,
        j = 0x6A,
        k = 0x6B,
        l = 0x6C,
        m = 0x6D,
        n = 0x6E,
        o = 0x6F,
        p = 0x70,
        q = 0x71,
        r = 0x72,
        s = 0x73,
        t = 0x74,
        u = 0x75,
        v = 0x76,
        w = 0x77,
        x = 0x78,
        y = 0x79,
        z = 0x7A,

        A = 0x41,
        B = 0x42,
        C = 0x43,
        D = 0x44,
        E = 0x45,
        F = 0x46,
        G = 0x47,
        H = 0x48,
        I = 0x49,
        J = 0x4A,
        K = 0x4B,
        L = 0x4C,
        M = 0x4D,
        N = 0x4E,
        O = 0x4F,
        P = 0x50,
        Q = 0x51,
        R = 0x52,
        S = 0x53,
        T = 0x54,
        U = 0x55,
        V = 0x56,
        W = 0x57,
        X = 0x58,
        Y = 0x59,
        Z = 0x5a,

        ampersand = 0x26,             // &
        asterisk = 0x2A,              // *
        at = 0x40,                    // @
        backslash = 0x5C,             // \
        backtick = 0x60,              // `
        bar = 0x7C,                   // |
        caret = 0x5E,                 // ^
        closeBrace = 0x7D,            // }
        closeBracket = 0x5D,          // ]
        closeParen = 0x29,            // )
        colon = 0x3A,                 // :
        comma = 0x2C,                 // ,
        dot = 0x2E,                   // .
        doubleQuote = 0x22,           // "
        equals = 0x3D,                // =
        exclamation = 0x21,           // !
        greaterThan = 0x3E,           // >
        hash = 0x23,                  // #
        lessThan = 0x3C,              // <
        minus = 0x2D,                 // -
        openBrace = 0x7B,             // {
        openBracket = 0x5B,           // [
        openParen = 0x28,             // (
        percent = 0x25,               // %
        plus = 0x2B,                  // +
        question = 0x3F,              // ?
        semicolon = 0x3B,             // ;
        singleQuote = 0x27,           // '
        slash = 0x2F,                 // /
        tilde = 0x7E,                 // ~

        backspace = 0x08,             // \b
        formFeed = 0x0C,              // \f
        byteOrderMark = 0xFEFF,
        tab = 0x09,                   // \t
        verticalTab = 0x0B,           // \v
    }

    export interface CancellationToken {
        isCancellationRequested(): boolean;
    }

    export interface CompilerHost {
        getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile;
        getDefaultLibFileName(options: CompilerOptions): string;
        getCancellationToken? (): CancellationToken;
        writeFile: WriteFileCallback;
        getCurrentDirectory(): string;
        getCanonicalFileName(fileName: string): string;
        useCaseSensitiveFileNames(): boolean;
        getNewLine(): string;
    }

    export interface TextSpan {
        start: number;
        length: number;
    }

    export interface TextChangeRange {
        span: TextSpan;
        newLength: number;
    }

    /* @internal */
    export interface DiagnosticCollection {
        // Adds a diagnostic to this diagnostic collection.
        add(diagnostic: Diagnostic): void;

        // Gets all the diagnostics that aren't associated with a file.
        getGlobalDiagnostics(): Diagnostic[];

        // If fileName is provided, gets all the diagnostics associated with that file name.
        // Otherwise, returns all the diagnostics (global and file associated) in this colletion.
        getDiagnostics(fileName?: string): Diagnostic[];

        // Gets a count of how many times this collection has been modified.  This value changes
        // each time 'add' is called (regardless of whether or not an equivalent diagnostic was
        // already in the collection).  As such, it can be used as a simple way to tell if any
        // operation caused diagnostics to be returned by storing and comparing the return value
        // of this method before/after the operation is performed.
        getModificationCount(): number;
    }
}
