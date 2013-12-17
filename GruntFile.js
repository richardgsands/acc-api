module.exports = function(grunt) {

    grunt.initConfig({
    	concurrent: {
		  dev: {
		    tasks: ['nodemon', 'watch'],
		    options: {
		      logConcurrentOutput: true
		    }
		  }
		},
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
        },
        nodemon: {
        	dev: {
        		options: {
        			file: 'app.js'
        		}
        	}
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('default', ['concurrent']);

};
