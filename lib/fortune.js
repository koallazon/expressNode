const fortuneCookies = [
    "하나",
    "둘",
    "셋",
    "넷",
    "다섯"
];
exports.getFortune = () => {
    const idx = Math.floor(Math.random() * fortuneCookies.length);
    return fortuneCookies[idx]
}