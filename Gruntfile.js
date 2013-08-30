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
                src: ['lib/*.js'],
                dest: 'dist/js/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            edatoolkit: {
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['<%= concat.edatoolkit.dest %>']
                }
            }
        }

    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
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
    grunt.registerTask('dist', ['clean', 'dist-js']);

    // Default task.
    grunt.registerTask('default', ['dist']);
};
