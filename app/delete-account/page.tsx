export const metadata = {
    title: 'Delete Account',
    description: 'Delete your account',
    robots: {
        index: false,
        follow: false,
    },
};

export default function DeleteAccountInfoPage() {
    return (
        <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>
                Delete your account
            </h1>

            <p style={{ marginBottom: '1rem' }}>
                You can permanently remove your account at any time. Here’s how:
            </p>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '1.5rem' }}>
                Steps
            </h2>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Go to <strong>Settings</strong>.</li>
                <li>Tap <strong>Delete account</strong>.</li>
                <li>Confirm — and voilà.</li>
            </ol>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '1.5rem' }}>
                What gets deleted instantly
            </h2>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', listStyle: 'disc' }}>
                <li>Images you uploaded</li>
                <li>Your name</li>
                <li>Your email</li>
                <li>Authentication tokens and active sessions</li>
                <li>Messages</li>
                <li>Groups and topics you created</li>
                <li>All other data related to your account</li>
            </ul>

            <p style={{ marginTop: '1rem' }}>
                This removal happens immediately.
            </p>
        </main>
    );
}
