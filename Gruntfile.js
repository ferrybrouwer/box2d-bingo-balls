module.exports = function (grunt) {

    /**
     * Load all grunt tasks
     */
    require('load-grunt-tasks')(grunt);

    /**
     * Initialize Grunt's configuration
     * @type {object}
     */
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    banner: '/* Happy Online | <%= pkg.name %> */\n'
                },
                files: {
                    'build/js/emailbingo.min.js': ['build/js/emailbingo.js'],
                    'build/js/html5.min.js': ['build/js/html5.js'],
                    'build/js/modernizr.min.js': ['build/js/modernizr.js']
                }
            }
        },

        concat: {
            options: {
                stripBanners: true,
                separator: ';'
            },
            global: {
                src: [
                    'js/happy/util/Console.js',
                    'js/vendor/jquery/dist/jquery.min.js',
                    'js/vendor/jquery-easing-original/jquery.easing.1.3.min.js',
                    'js/vendor/jquery.complexify.js/jquery.complexify.js',
                    'js/vendor/jquery.complexify.js/jquery.complexify.banlist.js',
                    'js/vendor/jquery-zclip/jquery.zclip.js',
                    'js/vendor/greensock/src/minified/TweenLite.min.js',
                    'js/vendor/greensock/src/minified/easing/EasePack.min.js',
                    'js/vendor/greensock/src/minified/plugins/ScrollToPlugin.min.js',
                    'js/vendor/greensock/src/minified/plugins/CSSPlugin.min.js',
                    'js/vendor/underscore/underscore.js',
                    'js/vendor/knockout.js/knockout.js',
                    'js/vendor/PreloadJS/lib/preloadjs-0.4.1.min.js',
                    'js/vendor/SoundJS/lib/soundjs-0.5.2.min.js',
                    'js/vendor/swfobject/swfobject/swfobject.js',
                    'js/vendor/html5shiv/dist/html5shiv.js',
                    'js/vendor/json2/json2.js',
                    'js/vendor/selectivizr-new/selectivizr.js',
                    'js/vendor/soundmanager2/script/soundmanager2-jsmin.js',
                    'js/vendor/requestAnimationFrame-polyfill/requestAnimationFrame.js',
                    'js/vendor/yepnope/yepnope.js',
                    'js/happy/util/KoCustomBindings.js',
                    'js/happy/util/KoCustomFunctions.js',
                    'js/happy/util/KoCustomExtenders.js',
                    'js/happy/util/jquery.columnresizer.js',
                    'js/happy/util/underscore.mixins.js',
                    'js/happy/ui/form.elements.js',
                    'js/happy/ui/Overlay.js',
                    'js/happy/ui/jquery.loader.js',
                    'js/happy/ui/jquery.progress.js',
                    'js/happy/ui/bingo/BingoSounds.js',
                    'js/happy/model/KoUserModel.js',
                    'js/happy/model/KoPopupModel.js',
                    'js/happy/model/KoFormModel.js',
                    'js/happy/model/KoVzaarModel.js',
                    'js/happy/model/KoRedeemModel.js',
                    'js/happy/model/KoProgressModel.js',
                    'js/happy/model/KoPaymentRequestModel.js',
                    'js/happy/model/KoNotificationModel.js',
                    'js/happy/model/KoTrackEventModel.js',
                    'js/happy/model/bingo/KoBingoFlashModel.js',
                    'js/happy/model/bingo/KoBingoModel.js',
                    'js/happy/model/bingo/KoBingoCardModel.js'
                ],
                dest: 'build/js/emailbingo.js',
                nonull: true
            },
            html5: {
                src: [
                    'js/vendor/box2dweb/Box2dWeb-2.1.a.3.js',
                    'js/vendor/easeljs/lib/easeljs-0.7.1.min.js',
                    'js/happy/ui/bingo/CanvasBowl.js',
                    'js/happy/ui/bingo/box2d.props/World.js',
                    'js/happy/ui/bingo/box2d.props/Ground.js',
                    'js/happy/ui/bingo/box2d.props/Ball.js',
                    'js/happy/ui/bingo/Box2dBowl.js'
                ],
                dest: 'build/js/html5.js',
                nonull: true
            },
            modernizr: {
                src: [
                    'js/vendor/modernizr/modernizr.js',
                    'js/vendor/detectizr/dist/detectizr.js'
                ],
                dest: 'build/js/modernizr.js',
                nonull: true
            }
        },

        compass: {
            dist: {
                options: {
                    environment: 'development',
                    sassDir: 'sass',
                    cssDir: 'css',
                    imagesDir: 'images',
                    javascriptsDir: 'js',
                    fontsDir: 'fonts',
                    relativeAssets: true,
                    httpPath: "/",
                    debugInfo: true,
                    outputStyle: 'expanded',
                    sourcemap: true
                }
            },
            deploy: {
                options: {
                    environment: 'production',
                    sassDir: 'sass',
                    cssDir: 'css',
                    imagesDir: 'images',
                    javascriptsDir: 'js',
                    fontsDir: 'fonts',
                    relativeAssets: true,
                    httpPath: "/",
                    debugInfo: true,
                    force: true,
                    outputStyle: 'compressed'
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            css: {
                files: ['sass/*.scss'],
                tasks: ['compass:dist']
            }
        },

        copy: {
            build: {
                options: {
                    processContentExclude: ['**/*.{png,gif,jpg,ico,svg,ttf,eot,woff,mp4,mp3,wav,WebM,ogv,swf,css,js,map,mo}'],
                    process: function (content, srcpath) {
                        switch (srcpath) {
                            case 'footer.php':
                                // overwrite global scripts with minified scripts
                                var globalPattern = new RegExp(/(<\?php \/\* {minify-global} \*\/)([\s\S]*)(\/* \{\/minify-global\} \*\/ \?>)/igm);
                                content = content.replace(globalPattern, '<script src="js/emailbingo.min.js"></script>');

                                // overwrite html5 scripts with minified scripts
                                var html5Pattern = new RegExp(/(<\?php \/\* {minify-html5} \*\/)([\s\S]*)(\/* \{\/minify-html5\} \*\/ \?>)/igm);
                                content = content.replace(html5Pattern, "'js/html5.min.js',");

                                break;
                            case 'header.php':
                                // header scripts with minified scripts
                                var headerPattern = new RegExp(/(<\?php \/\* {header-scripts} \*\/)([\s\S]*)(\/* \{\/header-scripts\} \*\/ \?>)/igm);
                                content = content.replace(headerPattern, '<script src="js/modernizr.min.js"></script>');

                                break;
                        }

                        return content;
                    }
                },
                files: [
                    {
                        expand: true,
                        src: ['css/**', 'flash/**', 'fonts/**', 'images/**', 'server/**', 'sounds/**', '*.php', '.htaccess'],
                        dest: 'build/',
                        filter: function (filepath) {
                            var isAs3 = (/AS3|(\.as$)/).test(filepath);
                            var isFontCompiler = (/(emailbingo\-icons)\/[^f]+/).test(filepath);
                            var isImage = (/images/).test(filepath);
                            var isExecutable = (/(reorder\-retina)/).test(filepath);
                            return !(isAs3 || isFontCompiler || isExecutable || isImage);
                        }
                    },
                    {
                        expand: true,
                        src: ['js/vendor/detectizr/dist/*', 'js/vendor/modernizr/modernizr.js', 'js/happy/app.js'],
                        dest: 'build/',
                    }
                ]
            }
        },

        imagemin: {
            deploy: {
                files: [
                    {
                        expand: true,
                        cwd: 'images/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: 'build/images/',
                        filter: function (filepath) {
                            var isSpriteManager = (/^(\bimages\/buttons(\-retina)?\/.*\.png\b)|(\bimages\/icons(\-retina)?\/.*\.png\b)$/g).test(filepath);
                            return !isSpriteManager;
                        }
                    }
                ]
            }
        }
    });

    /**
     * When there's no task provided, notify the
     * help message from our notification module
     *
     * @return {function}
     */
    grunt.registerTask('default', function () {
        grunt.log.writeln('Usage:'.cyan);
        grunt.log.writeln('$ grunt deploy: '.cyan + '   make files ready for remote server'.white);
        grunt.log.writeln('$ grunt watch:'.cyan + '     watch sass files and compile these to a css file when there are changes'.white);
    });

    /**
     * Development task
     * Running in development mode which watch the sass files for modifications and compiles with compass
     *
     * @return {function}
     */
    grunt.registerTask('development', ['watch']);

    /**
     * Deploy task
     * Uglify and concatenate the javascripts
     * Minify CSS
     *
     * @return {function}
     */
    grunt.registerTask('deploy', 'Make files ready for deployment', function () {
        // check if build directory exist, if so then delete it first
        if (grunt.file.isDir('build')) {
            grunt.file.delete('build');
        }

        // run deploy tasks
        grunt.task.run(['compass:deploy', 'copy', 'concat', 'uglify', 'imagemin']);
    });

};
