module.exports = (grunt) => {
    // 플러그인 로딩
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach((task) => {
        grunt.loadNpmTasks(task);
    });

    // 플러그인 설정
    grunt.initConfig({
        cafemocha: {
            all: { src: 'qa/tests-*.js', options: { ui: 'tdd'}, }
        },
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js',  'lib/**/*.js'],
        },
        exec: {
            linkchecker: { cmd: 'linkchecker http://localhost:3000' }
        },
    });

    // 작업 등록
    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};