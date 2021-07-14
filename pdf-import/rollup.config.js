import typescript from 'rollup-plugin-typescript2'

module.exports = {
    input: 'src/main.ts',
    output: {
        file: 'out/main.js',
        format: 'cjs',
        sourcemap: true,
    },
    context: 'this',
    plugins: [
        typescript({
            include: [
                "../**/*.ts",
            ]
        }),
    ],
    external: [
        'fs',
        'url',
        'path',

        'pdf-parse',
    ],
};
