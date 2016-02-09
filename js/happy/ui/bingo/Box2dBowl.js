/*
     ____            ___     _   ____                _ 
    |  _ \          |__ \   | | |  _ \              | |
    | |_) | _____  __  ) |__| | | |_) | _____      _| |
    |  _ < / _ \ \/ / / // _` | |  _ < / _ \ \ /\ / / |
    | |_) | (_) >  < / /| (_| | | |_) | (_) \ V  V /| |
    |____/ \___/_/\_\____\__,_| |____/ \___/ \_/\_/ |_|
 */
(function() {
    var $window = $(window),
        props = window.app.ui.box2d.props || {},
        ballContainer = document.getElementById('box2dBallContainer'),
        Box2d = window.app.model.Box2d || {
            'b2Vec2': Box2D.Common.Math.b2Vec2,
            'b2AABB': Box2D.Collision.b2AABB,
            'b2BodyDef': Box2D.Dynamics.b2BodyDef,
            'b2Body': Box2D.Dynamics.b2Body,
            'b2FixtureDef': Box2D.Dynamics.b2FixtureDef,
            'b2Fixture': Box2D.Dynamics.b2Fixture,
            'b2World': Box2D.Dynamics.b2World,
            'b2MassData': Box2D.Collision.Shapes.b2MassData,
            'b2PolygonShape': Box2D.Collision.Shapes.b2PolygonShape,
            'b2CircleShape': Box2D.Collision.Shapes.b2CircleShape,
            'b2DebugDraw': Box2D.Dynamics.b2DebugDraw,
            'b2MouseJointDef': Box2D.Dynamics.Joints.b2MouseJointDef,
            'b2Shape': Box2D.Collision.Shapes.b2Shape,
            'b2RevoluteJointDef': Box2D.Dynamics.Joints.b2RevoluteJointDef,
            'b2DistanceJointDef': Box2D.Dynamics.Joints.b2DistanceJointDef,
            'b2PrismaticJointDef': Box2D.Dynamics.Joints.b2PrismaticJointDef,
            'b2Joint': Box2D.Dynamics.Joints.b2Joint,
            'b2ContactListener': Box2D.Dynamics.b2ContactListener,
            'b2Settings': Box2D.Common.b2Settings,
            'scale': 30,
        };

    window.app.ui.box2d = window.app.ui.box2d || {};
    window.app.ui.box2d.Box2dBowl = Box2dBowl;

    function Box2dBowl() {
        this.balls = [];
        this.world = this._getWorld(0, 10);
        this.ground = new props.Ground(this.world);
        this.centeralized = false;
    }

    Box2dBowl.prototype = {

        /**
         * Get Box2d World
         * 
         * @private
         * @param {int} gravity_x
         * @param {int} gravity_y
         * @return {b2World}
         */
        _getWorld: function(gravity_x, gravity_y) {
            var gravity = new Box2d.b2Vec2(gravity_x || 0, gravity_y || 10);
            return new Box2d.b2World(gravity, true);
        },

        /**
         * Get total width of all balls current added to world
         * 
         * @private
         * @return {number}
         */
        _getTotalBallsWidth: function() {
            return this.balls.length > 0 ? this.balls.length * ((this.balls[0].radius * Box2d.scale) * 2) : 0;
        },

        /**
         * Get ball distance from the center point
         * 
         * @private
         * @param  {Ball} ball
         * @return {number}
         */
        _getBallDistance: function(ball) {
            var middle = this.ground.width() / 2;
            return Math.floor(ball.x() > middle ? ball.x() - middle : middle - ball.x());
        },

        /**
         * Centeralize balls
         *
         * @public
         * @return {void}
         */
        centeralizeBalls: function() {
            // get outer margin
            var outer_margin = (this.ground.width() - this._getTotalBallsWidth()) * .1;

            // get force direction
            var first_ball = _.last(this.balls),
                last_ball = _.first(this.balls),
                middle = this.ground.width() / 2,
                first_ball_distance = this._getBallDistance(first_ball),
                last_ball_distance = this._getBallDistance(last_ball),
                force_direction = first_ball_distance > last_ball_distance ? 'right' : 'left';

            // get distance to move
            var distance = first_ball_distance > last_ball_distance ? first_ball_distance : last_ball_distance,
                distance_to_move = (distance > this._getTotalBallsWidth()/2) ? distance - this._getTotalBallsWidth()/2 : 0;

            // apply force when needed only when distance to move is bigger then the margin
            if (distance_to_move >= outer_margin) {  
                _.each(this.balls, function(ball){
                    var force = force_direction === 'left' ? -7 : 7,
                        rotation = force_direction === 'left' ? -9 : 9;

                    // apply force push
                    ball.body.ApplyImpulse(
                        new Box2d.b2Vec2(force/Box2d.scale, 0),
                        ball.body.GetWorldCenter()
                    );

                    // apply force rotation
                    ball.body.ApplyTorque(rotation);
                });
            }
        },

        /**
         * Add ball
         *
         * @public
         * @param  {string} label
         * @param  {string} color
         * @return {void}
         */
        addBall: function(label, color){
            var ball = new props.Ball(this.world, label, color);
            ballContainer.appendChild( ball.html );
            this.balls.push(ball);
        },

        /**
         * Update world
         *
         * @public
         * @return {void}
         */
        updateWorld: function(){
            // draw debug data if enabled
            if ( this.debug && this.debug() === true ){
                this.world.DrawDebugData();
            }

            // clear and set force steps
            this.world.Step(1/30, 3, 1);
            this.world.ClearForces();

            // variables to define the do_centeralize_call method
            var bodies_sleep_count = 0;

            // update ball positions
            for ( var i=0; i<this.balls.length; i++ ){
                var ball = this.balls[i];
                ball.update();

                // when last ball has enter the world
                // check if all bodies are to sleep
                if ( this.balls.length === _.uniq(window.app.model.bingo.balls).length && !this.centeralized) {
                    if ( !ball.body.IsAwake() ) {
                        bodies_sleep_count += 1;

                        if ( this.balls.length === bodies_sleep_count ) {
                            this.centeralizeBalls();
                        }
                    }
                }
            }

            // recursive this method when window can animate the requested frame
            this.animFrame = window.requestAnimationFrame(this.updateWorld.bind(this));
        },

        /**
         * Stop updating world after 10s
         *
         * @public
         * @return {void}
         */
        stopUpdateWorld: function(){
            var _this = this;

            if ( _this.animFrame ){
                setTimeout(function() {
                    _this.animFrame = window.cancelAnimationFrame(_this.animFrame);
                }, 10000);
            }
        },

        /**
         * Stop updating world without any timeout
         *
         * @public
         * @return {void}
         */
        immediatelyStopUpdateWorld: function() {
            this.animFrame = window.cancelAnimationFrame(this.animFrame);
        },

        /**
         * Debug enabled
         *
         * @public
         * @param  {boolean} boolean
         * @return {void}
         */
        debug: function(boolean){
            var createDebugCanvas = function(){
                var canvas = document.createElement('canvas');
                canvas.setAttribute('width', $window.width());
                canvas.setAttribute('height', $(ballContainer).height());
                canvas.style.backgroundColor = 'rgba(0,255,0,.1)';
                canvas.style.position = 'absolute';
                canvas.style.bottom = '0';
                ballContainer.appendChild(canvas);
                return canvas;
            };
            if ( boolean === true ){
                var debugDraw = new Box2d.b2DebugDraw();
                debugDraw.SetSprite( createDebugCanvas().getContext('2d') );
                debugDraw.SetDrawScale( Box2d.scale );
                debugDraw.SetFillAlpha(0.3);
                debugDraw.SetLineThickness(1.0);
                debugDraw.SetFlags( Box2d.b2DebugDraw.e_shapeBit | Box2d.b2DebugDraw.e_jointBit );
                this.world.SetDebugDraw( debugDraw );
                this._debug = boolean;
            }
            return _.isUndefined(this._debug) ? false : this._debug;
        }
    };
})();