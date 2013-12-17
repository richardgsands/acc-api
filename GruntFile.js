module.exports = function(grunt) {

    grunt.initConfig({
        compass: {                          
            develop: {      
                options: {
                    sassDir: 'scss/',
                    cssDir: 'static/css/',
                }
            }
        },
        watch: {
            styles: {
                files: ['scss/**/*.scss'],
                tasks: ['compass:develop'],
                options: {
                  debounceDelay: 500,
                }
            },
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['compass:develop', 'watch']);

};
