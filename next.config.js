module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/game',
                permanent: false,
            },
        ]
    },
}
