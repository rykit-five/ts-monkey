

export type TokenType = string;

export class TokenList {
    static readonly ILLEGAL     = "ILLEGAL";
    static readonly EOF         = "EOF";

	// Identifiers + literals
	static readonly IDENT       = 'IDENT'; // add, foobar, x, y, ...
	static readonly INT         = 'INT';   // 1343456

	// Operators
	static readonly ASSIGN      = '=';
	static readonly PLUS        = '+';
	static readonly MINUS       = '-';
	static readonly BANG        = '!';
	static readonly ASTERISK    = '*';
	static readonly SLASH       = '/';

	static readonly LT          = '<';
	static readonly GT          = '>';

	static readonly EQ          = '==';
	static readonly NOT_EQ      = '!=';

	// Delimiters
	static readonly COMMA       = ',';
	static readonly SEMICOLON   = ';';

	static readonly LPAREN      = '(';
	static readonly RPAREN      = ')';
	static readonly LBRACE      = '{';
	static readonly RBRACE      = '}';

	// Keywords
	static readonly FUNCTION    = 'FUNCTION';
	static readonly LET         = 'LET';
	static readonly TRUE        = 'TRUE';
	static readonly FALSE       = 'FALSE';
	static readonly IF          = 'IF';
	static readonly ELSE        = 'ELSE';
	static readonly RETURN      = 'RETURN';
}

export class Token {
    type_: TokenType;
    literal: string;

    constructor(type_: TokenType, literal: string) {
        this.type_ = type_;
        this.literal = literal;
    }
    
    setType(type_: TokenType) {
        this.type_ = type_;
    }

    setLiteral(literal: string) {
        this.literal = literal;
    }
}
