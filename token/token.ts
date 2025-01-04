export enum TokenType {
    ILLEGAL = "ILLEGAL",
    EOF = "EOF",

    // Identifiers + literals
    IDENT = "IDENT", // add, foobar, x, y, ...
    INT = "INT", // 1343456
    STRING = "STRING", // "foobar"

    // Operators
    ASSIGN = "=",
    PLUS = "+",
    MINUS = "-",
    BANG = "!",
    ASTERISK = "*",
    SLASH = "/",
    BACKSLASH = "\\",

    LT = "<",
    GT = ">",

    EQ = "==",
    NOT_EQ = "!=",

    // Delimiters
    COMMA = ",",
    SEMICOLON = ",",
    COLON = ":",

    LPAREN = "(",
    RPAREN = ")",
    LBRACE = "{",
    RBRACE = "}",
    LBRACKET = "[",
    RBRACKET = "]",

    // Keywords
    FUNCTION = "FUNCTION",
    LET = "LET",
    TRUE = "TRUE",
    FALSE = "FALSE",
    IF = "IF",
    ELSE = "ELSE",
    RETURN = "RETURN",
}

const Keywords = new Map([
    ["fn", TokenType.FUNCTION],
    ["let", TokenType.LET],
    ["true", TokenType.TRUE],
    ["false", TokenType.FALSE],
    ["if", TokenType.IF],
    ["else", TokenType.ELSE],
    ["return", TokenType.RETURN],
]);

export class Token {
    type: TokenType;
    literal: string;

    constructor(type: TokenType, literal: string) {
        this.type = type;
        this.literal = literal;
    }

    SetType(type: TokenType) {
        this.type = type;
    }

    SetLiteral(literal: string) {
        this.literal = literal;
    }
}

export function LookupIdent(ident: string): TokenType {
    const tok = Keywords.get(ident);
    if (tok != undefined) {
        return tok;
    }
    return TokenType.IDENT;
}
