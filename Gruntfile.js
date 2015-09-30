/* Wrapper function */
module.exports = function(grunt){

  /* Initialize  grunt tasks */
  grunt.initConfig({
    /* Importing metadata from package.json */
    pkg: grunt.file.readJSON('package.json'),

    /* Uglify with concat & sourceMap */
    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      build: {
        src: ['client/**/*.js', '!client/libs/**/*.js'],
        dest: 'client/build/ugly.min.js'
      }
    },

    jshint: {
      all: ['client/**/*.js', 'server/**/*.js', '!client/libs/**/*.js', '!client/stub.js', '!client/build/**/*', 'test/**/*.js'],
      options: {
        loopfunc: true
      }
    },

    watch: {
      client_js_changes: {
        /* Will test (and lint) new code, and build if pass. Will livereload on default port */
        files: ['client/**/*.js', '!client/lib/**/*.js'],
        tasks: ['jshint', 'exec:test_client', 'uglify'],
        options: {
          livereload: true
        }
      },
      client_sass_changes: {
        files: ['client/**/*.sass'],
        tasks: ['sass'],
        options: {
          livereload: true
        }
      },
      server_changes: {
        /* If tests in server are updated or files in the server folder */
        files: ['server/**/*.js'],
        tasks: ['exec:test_server']
      }
    },
    
    /* For executing command line scripts */
    exec: {
      test: {
        command: 'mocha test test/**/*.js'
      },
      test_server: {
        command: 'mocha test test/server/**/*.js'
      },
      test_client: {
        command: 'mocha test test/client/**/*.js'
      }
    },

    sass: {
      dist: {
        files: {
          'client/build/style.css': 'client/styles/*.sass'
        }
      }
    }


  });

  /* Load Tasks from npm */
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-exec');

  /* Register custom tasks. Default is just a building */
  grunt.registerTask('default', [
    'sass',
    'uglify'
  ]);
  
  grunt.registerTask('test', [
    'jshint',
    'exec:test'
  ]);

  grunt.registerTask('build', [
    'sass',
    'uglify'
  ]);

  grunt.registerTask('test-server', [
    'jshint',
    'exec:test_server'
  ]);

  grunt.registerTask('test-client', [
    'jshint',
    'exec:test_client'
  ]);

  grunt.registerTask('sassify', [
    'sass'
  ]);
}
