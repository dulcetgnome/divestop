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
        src: ['client/add/*.js', 'client/divesite/*.js', 'client/map/*.js', 'client/search/*.js', 'client/services/*.js', 'client/*.js'],
        dest: 'client/build/ugly.min.js'
      }
    }
  });

  /* Load Tasks from npm */
  grunt.loadNpmTasks('grunt-contrib-uglify');

  /* Register custom tasks */
  grunt.registerTask('default', [
    'uglify'
  ]);
    
}
