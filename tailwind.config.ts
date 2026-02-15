import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    theme: {
        extend: {
            colors: {
                'prayer-teal': {
                    '50': '#ecfeff',
                    '100': '#cffafe',
                    '200': '#a5f3fc',
                    '300': '#67e8f9',
                    '400': '#22d3ee',
                    '500': '#0891B2',
                    '600': '#0e7490',
                    '700': '#155e75',
                    '800': '#164e63',
                    '900': '#143a4a',
                    '950': '#072f3d',
                },
            }
        }
    }
}
