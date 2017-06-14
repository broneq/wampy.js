/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 13.06.17
 */

const routerUrl = 'ws://fake.server.org/ws/',
    root = (typeof process === 'object' &&
    Object.prototype.toString.call(process) === '[object process]') ?
        global : window;

import { expect } from 'chai';
import * as WebSocketModule from './fake-ws';
import { Wampy } from './../src/wampy';
import { BadSerializer } from './BadSerializer';
import { WAMP_ERROR_MSG } from './../src/constants';

describe('Wampy.js Constructor', function () {
    this.timeout(0);

    before(function () {
        WebSocketModule.startTimers();
    });

    after(function () {
        WebSocketModule.clearTimers();
        WebSocketModule.resetCursor();
    });

    it('disallows to connect on instantiation without websocket provided (in Node.js env)', function () {
        let wampy = new Wampy(routerUrl, { realm: 'AppRealm' }),
            opStatus = wampy.getOpStatus();

        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_WS_OR_URL);
    });

    it('disallows to connect on instantiation without realm', function () {
        let wampy = new Wampy(routerUrl),
            opStatus = wampy.getOpStatus();

        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_REALM);
    });

    it('Allows to create a wampy instance without router url and any options', function () {
        let wampy = new Wampy(),
            opStatus = wampy.getOpStatus();

        expect(opStatus.code).to.be.equal(0);
    });

    it('disallows to connect on instantiation without specifying all of [onChallenge, authid, authmethods]', function () {
        let wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', authmethods: 'string' }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid', authmethods: ['wampcra'] }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', authid: 'userid', onChallenge: function () {
            }
        }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', authmethods: ['wampcra'], onChallenge: function () {
            }
        }),
            opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authid: 'userid' });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, { realm: 'AppRealm', authmethods: ['wampcra'] });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);

        wampy = new Wampy(routerUrl, {
            realm: 'AppRealm', onChallenge: function () {
            }
        });
        opStatus = wampy.getOpStatus();
        expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.NO_CRA_CB_OR_ID);
    });

    it('disallows to connect when trying to use custom serializer with not supported binaryType', function (done) {
        let wampy = new Wampy(routerUrl, {
            realm: 'AppRealm',
            ws: WebSocketModule.WebSocket,
            serializer: new BadSerializer()
        });
        root.setTimeout(function () {
            let opStatus = wampy.getOpStatus();
            expect(opStatus).to.be.deep.equal(WAMP_ERROR_MSG.INVALID_SERIALIZER_TYPE);
            done();
        }, 20);

    });

});
