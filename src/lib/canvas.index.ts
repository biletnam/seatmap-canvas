/*
 * index.ts
 * https://github.com/seatmap/canvas Copyright 2018 Ali Sait TEKE
 */


import "../scss/style.scss";
import * as d3 from 'd3';
import Svg from "./svg/svg.index";
import SeatMapDevTools from "./dev.tools";
import DataModel from "./models/data.model";

import BlockModel from "./models/block.model";
import DefaultsModel from "./models/defaults.model";
import {GlobalModel} from "./models/global.model";

import ZoomManager from "./svg/zoom.manager";
import EventManager from "./svg/event.manager";
import {EventType, ZoomLevel} from "./enums/global";
import WindowManager from "./window.manager";


declare const window: any;


export class SeatMapCanvas {

    public node: any = null;
    public svg: Svg;
    public dev: SeatMapDevTools;
    public data: DataModel;
    public config: DefaultsModel;
    public global: GlobalModel;
    public windowManager: WindowManager;
    public zoomManager: ZoomManager;
    public eventManager: EventManager;
    public addEventListener: any;


    constructor(public container_selector: any, _config: any = {}) {
        let _self = this;
        this.config = new DefaultsModel(_config);
        this.eventManager = new EventManager(this);
        this.addEventListener = this.eventManager.addEventListener;
        this.node = d3.select(container_selector);
        this.windowManager = new WindowManager(this);
        this.zoomManager = new ZoomManager(this);


        this.data = new DataModel(this);

        this.global = {
            eventManager: this.eventManager,
            windowManager: this.windowManager,
            config: this.config,
            data: this.data,
            zoomManager: this.zoomManager,
            root: this,
            svg: this.svg,
            multi_select: false,
            best_available: false
        };
        d3.select(window).on("keydown.dispatch", function (a, b, c) {
            _self.eventManager.dispatch(EventType.KEYDOWN_SVG, d3.event);
        });
        d3.select(window).on("keyup.dispatch", function (a, b, c) {
            _self.eventManager.dispatch(EventType.KEYUP_SVG, d3.event);
        });

        this.dev = new SeatMapDevTools(this);
        this.svg = new Svg(this);

        this.svg.domGenerate(this.node);
        this.svg.update();


        this.windowManager.resizeHandler();
        this.zoomManager.init();

        this.eventManager.addEventListener(EventType.CLICK_ZOOMOUT, () => this.zoomManager.zoomToVenue());
        this.eventManager.addEventListener(EventType.MULTI_SELECT_ENABLE, () => this.global.multi_select = true);
        this.eventManager.addEventListener(EventType.MULTI_SELECT_DISABLE, () => this.global.multi_select = false);
        this.eventManager.addEventListener(EventType.BEST_AVAILABLE_ENABLE, () => this.global.best_available = true);
        this.eventManager.addEventListener(EventType.MBEST_AVAILABLE_DISABLE, () => this.global.best_available = false);

        // Zoomout button show/hide for zoom level
        this.eventManager.addEventListener(EventType.ZOOM_LEVEL_CHANGE, (zoom_level: any) => {
            if (zoom_level.level === ZoomLevel.VENUE) {
                d3.select(this.config.zoom_out_button).style("display", "none");
            } else if (zoom_level.level === ZoomLevel.BLOCK) {
                d3.select(this.config.zoom_out_button).style("display", "none");
            } else if (zoom_level.level === ZoomLevel.SEAT) {
                d3.select(this.config.zoom_out_button).style("display", "block");
            }
        });

        d3.select(this.config.zoom_out_button).on("click", () => {
            this.zoomManager.zoomToVenue(true);
        });


        // this.eventManager.addEventListener(EventType.KEYDOWN_SVG,()=>{
        //     console.log(123);
        // });


        // update block data change trigger
        this.eventManager.addEventListener(EventType.ADD_BLOCK, (addedBlocks: Array<BlockModel>) => {
            //let blocks = this.data.getBlocks();
            this.svg.stage.blocks.update();

            this.windowManager.resizeHandler();
            this.zoomManager.calculateZoomLevels(this.data.getBlocks());
            this.zoomManager.calculateActiveBlocks(this.data.getBlocks());
            //console.log("added block", addedBlocks)
            this.windowManager.resizeHandler();


            this.zoomManager.zoomToVenue(false);
        });


        // this.eventManager.addEventListener(EventType.CLICK_BLOCK, (_block: Block) => {
        //     console.log(_block)
        //     //this.svg.node.interrupt().call(this.svg.zoomTypes.animated.translateTo, _block.item.zoom_bbox.x, _block.item.zoom_bbox.y).call(this.svg.zoomTypes.animated.scaleTo, _block.item.zoom_bbox.a);
        // });


        // setTimeout(()=>{
        //     this.zoomManager.zoom(ZoomLevel.VENUE);
        // },2500)


    }


}

window['SeatMapCanvas'] = SeatMapCanvas;