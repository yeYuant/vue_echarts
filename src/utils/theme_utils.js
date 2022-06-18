const theme = {
    chalk: {
        // 背景颜色
        backgroundColor: '#161522',
        // 标题的文字颜色
        titleColor: '#fff',
        // 左上角标识的颜色
        // 切换主体按钮的图片路径
        themeSrc: 'qiehuan_dark.png',
        // 页面顶部的边框图片
        headerBorderSrc: 'header_border_dark.png'
    },
    vintage: {
        // 背景颜色
        backgroundColor: '#eee',
        // 标题的文字颜色
        titleColor: '#000',
        // 左上角标识的颜色
        // 切换主体按钮的图片路径
        themeSrc: 'qiehuan_light.png',
        // 页面顶部的边框图片
        headerBorderSrc: 'header_border_light.png'
    }
}

export function getThemeValue(themeName) {
    return theme[themeName]
}