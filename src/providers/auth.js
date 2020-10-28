import Authorize from 'matsumoto/src/core/auth/authorize';

async function getAccessToken() {
    try {
        const user = await Authorize.getUser();
        if (!user?.access_token) {
            window.location.reload();
        }
        return user.access_token;
    } catch {
        window.location.reload();
    }
}

export {
    getAccessToken
}
