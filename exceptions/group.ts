export class NotAGroupMemberException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotAGroupMemberException";
    }
}

export class AlreadyAMemberException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlreadyAMemberException";
    }
}
    
export class UserUnauthorizedException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserUnauthorizedException";
    }
}

export class GroupLimitReachedException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GroupLimitReachedException";
    }
}

export class GroupNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GroupNotFoundException";
    }
}