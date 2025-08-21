import { auth } from "@/auth";

const RoleMapping: { [key: string]: number } = {
    "USER": 1,
    "ASSOCIATE": 2,
    "ADMIN": 3,
    "SUPERADMIN": 4
};

export const currentUser = async () => {
    const session = await auth()
    return session?.user
}

export const currentRole = async () => {
    const session = await auth()
    return session?.user
}

export const canAccess = (currentRole: string | undefined, allowedRole: string): boolean => {
    if (!currentRole) {
        return false;
    }
    return RoleMapping[currentRole] >= RoleMapping[allowedRole];
}