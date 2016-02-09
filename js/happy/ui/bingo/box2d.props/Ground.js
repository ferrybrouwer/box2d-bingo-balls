/*
     ____            ___     _                            _____                           _ 
    |  _ \          |__ \   | |                          / ____|                         | |
    | |_) | _____  __  ) |__| |  _ __  _ __ ___  _ __   | |  __ _ __ ___  _   _ _ __   __| |
    |  _ < / _ \ \/ / / // _` | | '_ \| '__/ _ \| '_ \  | | |_ | '__/ _ \| | | | '_ \ / _` |
    | |_) | (_) >  < / /| (_| | | |_) | | | (_) | |_) | | |__| | | | (_) | |_| | | | | (_| |
    |____/ \___/_/\_\____\__,_| | .__/|_|  \___/| .__/   \_____|_|  \___/ \__,_|_| |_|\__,_|
                                | |             | |                                         
                                |_|             |_|                                         
 */
(function() {
    var $window = $(window),
        defaultProps = {
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            debug: false
        },
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
    window.app.ui.box2d.props = window.app.ui.box2d.props || {};
    window.app.ui.box2d.props.Ground = Ground;

    if (!_.has(Box2D.Dynamics.b2Body.prototype, 'DrawVectorTo')) {
        /**
         * Draw vector shape by given points
         * Extend b2Body Class
         *
         * @this {b2Body}
         * @param {array} points
         * @return {b2Body}
         */
        Box2d.b2Body.prototype.DrawVectorTo = function(points) {
            var self = this,
                lastPoint;
            _.each(points, function(obj) {
                if (!_.isUndefined(lastPoint)) {
                    var edgeShape = new Box2d.b2PolygonShape(),
                        fromVector = new Box2d.b2Vec2(lastPoint.x / Box2d.scale, lastPoint.y / Box2d.scale),
                        toVector = new Box2d.b2Vec2(obj.x / Box2d.scale, obj.y / Box2d.scale);

                    // create edge polygon shape and add fixture to the body
                    edgeShape.SetAsEdge(fromVector, toVector);
                    self.CreateFixture2(edgeShape);
                }
                lastPoint = obj;
            });
            return self;
        };
    }

    function Ground(world) {
        this.world = world;
        this._buildBodies();
        this.width($window.width() < 980 ? 980 : $window.width());
        this.height(135);
        this.x(0);
        this.y(62);
    }
    Ground.prototype = {
        /**
         * Build all static bodies
         * @return {void}
         */
        _buildBodies: function() {
            this.bodies = [];
            this.bodies.push(this._createCurvedStaticBody('bottom', this.height() - 45));
            this.bodies.push(this._createCurvedStaticBody('top', this.height() - 45));
            this.bodies.push(this._createRightWall('rightwall'));
            this.bodies.push(this._createLeftWall('leftwall'));
            this.bodies.push(this._createLeftWallVertical('leftwallVertical'));
        },

        /**
         * Destroy all bodies from world
         * @return {void}
         */
        _destroyAllBodiesFromWorld: function() {
            var self = this;
            _.each(self.bodies, function(body) {
                self.world.DestroyBody(body);
            });
        },

        /**
         * Create a curved static body
         * @param {string} id
         * @param {int} controllY
         * @return {b2Body}
         */
        _createCurvedStaticBody: function(id, controllY) {
            var self = this;

            // create body definition
            var bd = new Box2d.b2BodyDef();
            bd.type = Box2d.b2Body.b2_staticBody;
            bd.userData = {
                id: id
            };

            var points = [],
                points_x = [];

            for (var i = 0; i < 4; i++) {
                var x = ((this.width() / 3) * i);
                points_x.push(x);
            }

            var pontoA = new Box2d.b2Vec2(points_x[0], 0);
            var pontoB = new Box2d.b2Vec2(points_x[1], controllY);
            var pontoC = new Box2d.b2Vec2(points_x[2], controllY);
            var pontoD = new Box2d.b2Vec2(points_x[3], 0);
            var x1 = pontoA.x;
            var y1 = pontoA.y;
            var x2, y2, t;

            for (var t = 0; t < 1.01; t += 0.01) {
                var ax = Math.pow((1 - t), 3) * pontoA.x;
                var ay = Math.pow((1 - t), 3) * pontoA.y;
                var bx = 3 * t * Math.pow((1 - t), 2) * pontoB.x;
                var by = 3 * t * Math.pow((1 - t), 2) * pontoB.y;
                var cx = 3 * Math.pow(t, 2) * (1 - t) * pontoC.x;
                var cy = 3 * Math.pow(t, 2) * (1 - t) * pontoC.y;
                var dx = Math.pow(t, 3) * pontoD.x;
                var dy = Math.pow(t, 3) * pontoD.y;
                x2 = ax + bx + cx + dx;
                y2 = ay + by + cy + dy;
                points.push({
                    x: x2,
                    y: y2
                });
            }

            // shrimp existing points
            var newPoints = [];
            for (var c = 0; c < points.length; c++) {
                if (c == 0 || c == points.length - 1 || c == (points.length - 1) / 2) {
                    newPoints.push(points[c]);
                } else {
                    if (c % 20 == 0) {
                        newPoints.push(points[c]);
                    }
                }
            }
            points = newPoints;

            // return body which contains a vector shape drawn points
            return this.world.CreateBody(bd).DrawVectorTo(points);
        },

        /**
         * Create left wall inserting balls static body
         * @param  {string} id
         * @return {b2Body}
         */
        _createLeftWall: function(id) {
            // create body definition
            var bd = new Box2d.b2BodyDef();
            bd.type = Box2d.b2Body.b2_staticBody;
            bd.userData = {
                id: id
            };

            // position
            bd.position.x = -100 / Box2d.scale;
            bd.position.y = (this._height + 70) / Box2d.scale;

            // return body which contains a vector shape drawn points
            return this.world.CreateBody(bd).DrawVectorTo([
                {x:0, y:-100}, 
                {x:10, y:0},
                {x:15, y:20}, 
                {x:25, y:40}, 
                {x:40, y:60},
                {x:60, y:70},
                {x:100, y:80}
            ]);
        },

        /**
         * Create left wall vertical line to prevent multiple balls entering the levels at once
         * @param  {string} id
         * @return {b2Body}
         */
        _createLeftWallVertical: function(id) {
            // create body definition
            var bd = new Box2d.b2BodyDef();
            bd.type = Box2d.b2Body.b2_staticBody;
            bd.userData = {
                id: id
            };

            // return body which contains a vector shape drawn points
            // return this.world.CreateBody(bd).DrawVectorTo([
            //     {x:0, y:-100},
            //     {x:0, y:50}
            // ]);

            var addX = -42,
                addY = -7;

            return this.world.CreateBody(bd).DrawVectorTo([
                {x:0 + addX, y:-100 + addY}, 
                {x:10 + addX, y:0 + addY},
                {x:15 + addX, y:20 + addY}, 
                {x:25 + addX, y:40 + addY}, 
                {x:40 + addX, y:60 + addY}
            ]);
        },

        /**
         * Create right wall stop ball from falling out of screen
         * @param  {string} id
         * @return {b2Body}
         */
        _createRightWall: function(id) {
            // create body definition
            var bd = new Box2d.b2BodyDef();
            bd.type = Box2d.b2Body.b2_staticBody;
            bd.userData = {
                id: id
            };

            bd.position.x = (this.width() + 10) / Box2d.scale;
            bd.position.y = (this.height() + 70) / Box2d.scale;

            // create fixture
            var fd = new Box2d.b2FixtureDef();
            fd.shape = new Box2d.b2PolygonShape();
            fd.shape.SetAsBox(10 / Box2d.scale, 35 / Box2d.scale);

            // append body definition to the world (creating the body)
            var body = this.world.CreateBody(bd);
            var fixture = body.CreateFixture(fd);

            return body;
        },

        /**
         * Getter / Setter x
         * @param  {int} value
         * @return {int}
         */
        x: function(value) {
            var self = this;
            if (!_.isUndefined(value)) {
                defaultProps.x = value;
                _.each(this.bodies, function(body) {
                    switch (body.GetUserData().id) {
                        case 'bottom':
                            body.SetPosition(new Box2d.b2Vec2(value / Box2d.scale, body.GetPosition().y));
                            break;
                        case 'top':
                            body.SetPosition(new Box2d.b2Vec2(value / Box2d.scale, body.GetPosition().y));
                            break;
                        case 'rightwall':
                            body.SetPosition(new Box2d.b2Vec2((self.width() + value + 10) / Box2d.scale, body.GetPosition().y));
                            break;
                        case 'leftwall':
                            body.SetPosition(new Box2d.b2Vec2((value - 100) / Box2d.scale, body.GetPosition().y));
                            break;
                        case 'leftwallVertical':
                            body.SetPosition(new Box2d.b2Vec2(value / Box2d.scale, body.GetPosition().y));
                            break;
                    }
                });
            }
            return defaultProps.x;
        },

        /**
         * Getter / Setter y
         * @param  {int} value
         * @return {int}
         */
        y: function(value) {
            if (!_.isUndefined(value)) {
                defaultProps.y = value;
                _.each(this.bodies, function(body) {
                    switch (body.GetUserData().id) {
                        case 'bottom':
                            body.SetPosition(new Box2d.b2Vec2(body.GetPosition().x, (value + 1) / Box2d.scale));
                            break;
                        case 'top':
                            body.SetPosition(new Box2d.b2Vec2(body.GetPosition().x, (value - 46) / Box2d.scale));
                            break;
                        case 'rightwall':
                            body.SetPosition(new Box2d.b2Vec2(body.GetPosition().x, (value - 30) / Box2d.scale));
                            break;
                        case 'leftwall':
                            body.SetPosition(new Box2d.b2Vec2(body.GetPosition().x, (value - 80) / Box2d.scale));
                            break;
                        case 'leftwallVertical':
                            body.SetPosition(new Box2d.b2Vec2(body.GetPosition().x, (value - 100) / Box2d.scale));
                            break;
                    }
                });
            }
            return defaultProps.y;
        },

        /**
         * Getter / Setter width
         * @param  {int} value
         * @return {int}
         */
        width: function(value) {
            if (!_.isUndefined(value)) {
                defaultProps.width = value;
                this._destroyAllBodiesFromWorld();
                this._buildBodies();
            }
            return defaultProps.width;
        },

        /**
         * Getter / Setter height
         * @param  {int} value
         * @return {int}
         */
        height: function(value) {
            if (!_.isUndefined(value)) {
                defaultProps.height = value;
                this._destroyAllBodiesFromWorld();
                this._buildBodies();
            }
            return defaultProps.height;
        },

        /**
         * Resize window
         * @return {void}
         */
        resize: function() {
            this.width($window.width() < 980 ? 980 : $window.width());
            this.x(0);
            this.y(62);
        }
    };
})();