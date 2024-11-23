

export type TokenType = string;

export class TokenKind {
    static readonly ILLEGAL     = "ILLEGAL";
    static readonly EOF         = "EOF";

	// Identifiers + literals
	static readonly IDENT       = 'IDENT';  // add, foobar, x, y, ...
	static readonly INT         = 'INT';    // 1343456
	static readonly STRING		= "STRING"; // "foobar"

	// Operators
	static readonly ASSIGN      = '=';
	static readonly PLUS        = '+';
	static readonly MINUS       = '-';
	static readonly BANG        = '!';
	static readonly ASTERISK    = '*';
	static readonly SLASH       = '/';
	static readonly BACKSLASH	= '\\';

	static readonly LT          = '<';
	static readonly GT          = '>';

	static readonly EQ          = '==';
	static readonly NOT_EQ      = '!=';

	static readonly TERMINAL	= '\\0';

	// Delimiters
	static readonly COMMA       = ',';
	static readonly SEMICOLON   = ';';
	static readonly COLON		= ':';

	static readonly LPAREN      = '(';
	static readonly RPAREN      = ')';
	static readonly LBRACE      = '{';
	static readonly RBRACE      = '}';
	static readonly LBRACKET    = '[';
	static readonly RBRACKET    = ']';

	// Keywords
	static readonly FUNCTION    = 'FUNCTION';
	static readonly LET         = 'LET';
	static readonly TRUE        = 'TRUE';
	static readonly FALSE       = 'FALSE';
	static readonly IF          = 'IF';
	static readonly ELSE        = 'ELSE';
	static readonly RETURN      = 'RETURN';
}

const Keywords = new Map([
	["fn", TokenKind.FUNCTION],
	["let", TokenKind.LET],
	["true", TokenKind.TRUE],
	["false", TokenKind.FALSE],
	["if", TokenKind.IF],
	["else", TokenKind.ELSE],
	["return", TokenKind.RETURN],
]);

export class Token {
    type_: TokenType;
    literal: string;

    constructor(type_: TokenType, literal: string) {
        this.type_ = type_;
        this.literal = literal;
    }
    
    SetType(type_: TokenType) {
        this.type_ = type_;
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
	return TokenKind.IDENT;
}
