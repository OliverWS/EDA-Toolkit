module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/**\n' +
                '* EDA Toolkit\n' +
                '* Copyright 2013 Oliver Wilder-Smith \n' +
                '* <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' +
                '*/\n',
        jqueryCheck: 'if (!jQuery) { throw new Error(\"EDA Toolkit requires jQuery\") }\n\n',
        // Task configuration.
        clean: {
            dist: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: false
            },
            edatoolkit: {
                src: ['js/numjs.js',
                      'js/signals.js',
                      'js/dropzone.js',
                      'js/videodroplet.js',
                      'js/eda_toolkit.js',
                      'js/edadroplet.js',
                      'js/folderdroplet.js',
                      'js/grapher.js',
                      'js/version.js'],
                dest: 'dist/js/<%= pkg.name %>.js'
            },
            edatoolkitworker: {
                src: ['js/numjs.js',
                      'js/signals.js',
                      'js/eda_toolkit.worker.js'],
                dest: 'dist/js/<%= pkg.name %>.worker.js'
            }

        },

        uglify: {
            options: {
                banner: '<%= banner %>',
                compress: false
            },
            edatoolkitworker:{
                files:{
                   'dist/js/<%= pkg.name %>.worker.min.js': ['<%= concat.edatoolkitworker.dest %>']
                }
            },

            edatoolkit: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['<%= concat.edatoolkit.dest %>']
                }
            }
        },
        
        copy: {
          main: {
            files: [
              {expand: true, src: ['css/*'], dest: 'dist/'}, // includes files in path
              {expand: true, src: ['index.html'], dest: 'dist/'}, // includes files in path
            ]
          }
        }
    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-recess');


    // Test task.

    // JS distribution task.
    grunt.registerTask('dist-js', ['concat', 'uglify']);

    // // CSS distribution task.
    // grunt.registerTask('dist-css', ['recess']);

    // Full distribution task.
    grunt.registerTask('dist', ['clean', 'dist-js','copy']);
    // Default task.
    grunt.registerTask('default', ['dist']);
};
