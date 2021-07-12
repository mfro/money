import typescript from 'rollup-plugin-typescript2'

module.exports = {
    input: 'src/main.ts',
    output: {
        file: 'main.js',
        format: 'cjs',
    },
    context: 'this',
    plugins: [
        typescript({
            tsconfig: "tsconfig.json",
            useTsconfigDeclarationDir: true,
        }),
    ],
    external: [
        'fs',
        'url',
        'http',
        'https',
    ],
};
