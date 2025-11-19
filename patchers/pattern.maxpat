{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 34.0, 62.0, 1724.0, 1024.0 ],
        "boxes": [
            {
                "box": {
                    "autosave": 1,
                    "id": "obj-1",
                    "inletInfo": {
                        "IOInfo": [
                            {
                                "type": "signal",
                                "index": 1,
                                "tag": "in1",
                                "comment": "phase"
                            },
                            {
                                "type": "signal",
                                "index": 2,
                                "tag": "in2",
                                "comment": "trigger in"
                            },
                            {
                                "type": "signal",
                                "index": 3,
                                "tag": "in3",
                                "comment": "regen"
                            }
                        ]
                    },
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 4,
                    "outletInfo": {
                        "IOInfo": [
                            {
                                "type": "signal",
                                "index": 1,
                                "tag": "out1",
                                "comment": "output (phase)"
                            },
                            {
                                "type": "signal",
                                "index": 2,
                                "tag": "out2",
                                "comment": "output (trigger)"
                            },
                            {
                                "type": "signal",
                                "index": 3,
                                "tag": "out3",
                                "comment": "size (samples)"
                            }
                        ]
                    },
                    "outlettype": [ "signal", "signal", "signal", "list" ],
                    "patcher": {
                        "fileversion": 1,
                        "appversion": {
                            "major": 9,
                            "minor": 1,
                            "revision": 0,
                            "architecture": "x64",
                            "modernui": 1
                        },
                        "classnamespace": "rnbo",
                        "rect": [ 34.0, 62.0, 1289.0, 1024.0 ],
                        "default_fontname": "Lato",
                        "title": "untitled",
                        "boxes": [
                            {
                                "box": {
                                    "id": "obj-33",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 234.4827425479889, 459.31031334400177, 26.206894755363464, 23.0 ],
                                    "rnbo_classname": "-",
                                    "rnbo_extra_attributes": {
                                        "hot": 0
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "-_obj-33",
                                    "text": "- 1"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-26",
                                    "maxclass": "newobj",
                                    "numinlets": 3,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 552.0, 354.96691703796387, 87.0, 23.0 ],
                                    "rnbo_classname": "clip~",
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "clip~_obj-26",
                                    "text": "clip~ 0. 0.9999"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-12",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 970.0, 525.0, 188.0, 23.0 ],
                                    "rnbo_classname": "out~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "out~_obj-12",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "in1": {
                                                "attrOrProp": 1,
                                                "digest": "signal sent to outlet with index 3",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "outlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "in1",
                                                "type": "signal",
                                                "digest": "signal sent to outlet with index 3",
                                                "displayName": "size (samples)",
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [],
                                        "helpname": "out~",
                                        "aliasOf": "out~",
                                        "classname": "out~",
                                        "operator": 0,
                                        "versionId": 1989326771,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "out~ 3 @comment \"size (samples)\""
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-25",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 288.2758423089981, 426.20686733722687, 55.0, 23.0 ],
                                    "rnbo_classname": "pipe",
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "pipe_obj-25",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "in1": {
                                                "attrOrProp": 1,
                                                "digest": "Anything to be delayed",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "Delayed number",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "number"
                                            },
                                            "time": {
                                                "attrOrProp": 1,
                                                "digest": "Delay time",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "125"
                                            },
                                            "flush": {
                                                "attrOrProp": 1,
                                                "digest": "Stop delay and output current value",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bang"
                                            },
                                            "stop": {
                                                "attrOrProp": 1,
                                                "digest": "Stop delay",
                                                "isalias": 0,
                                                "aliases": [ "clear" ],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bang"
                                            },
                                            "clear": {
                                                "attrOrProp": 1,
                                                "digest": "Stop delay",
                                                "isalias": 1,
                                                "aliasOf": "stop",
                                                "aliases": [],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bang"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "in1",
                                                "type": "number",
                                                "digest": "Anything to be delayed",
                                                "defaultarg": 1,
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "time",
                                                "type": "number",
                                                "digest": "Delay time",
                                                "defaultarg": 2,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "number",
                                                "digest": "Delayed number",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "pipe",
                                        "aliasOf": "pipe",
                                        "classname": "pipe",
                                        "operator": 0,
                                        "versionId": -1187956124,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "pipe 125"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-24",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 1052.3179686069489, 426.22701358795166, 79.0, 23.0 ],
                                    "rnbo_classname": "speedlim",
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "speedlim_obj-24",
                                    "text": "speedlim 250"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-22",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 297.241358935833, 497.2413452267647, 98.0, 23.0 ],
                                    "rnbo_classname": "loadmess",
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "loadmess_obj-22",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "input": {
                                                "attrOrProp": 1,
                                                "digest": "Bang to trigger message.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "inlet": 1,
                                                "type": "bang"
                                            },
                                            "message": {
                                                "attrOrProp": 1,
                                                "digest": "Message when patcher is loaded.",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "outlet": 1,
                                                "type": "list",
                                                "defaultValue": ""
                                            },
                                            "startupbang": {
                                                "attrOrProp": 1,
                                                "digest": "startupbang",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "type": "bang"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "input",
                                                "type": "bang",
                                                "digest": "Bang to trigger message.",
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "message",
                                                "type": "list",
                                                "digest": "Message when patcher is loaded.",
                                                "defaultarg": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "loadmess",
                                        "aliasOf": "loadmess",
                                        "classname": "loadmess",
                                        "operator": 0,
                                        "versionId": -361086158,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "loadmess 0 0 1 1"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-19",
                                    "linecount": 4,
                                    "maxclass": "newobj",
                                    "numinlets": 4,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "signal" ],
                                    "patching_rect": [ 462.06893384456635, 399.367129445076, 71.03447788953781, 66.0 ],
                                    "rnbo_classname": "wave~",
                                    "rnbo_extra_attributes": {
                                        "channels": 1.0,
                                        "boundmode": "wrap",
                                        "channelmode": "wrap",
                                        "interp": "linear"
                                    },
                                    "rnbo_serial": 3,
                                    "rnbo_uniqueid": "wave~_obj-19",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "phase": {
                                                "attrOrProp": 1,
                                                "digest": "Phase to read (0..1, between start and end).",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "start": {
                                                "attrOrProp": 1,
                                                "digest": "Start index (samples)",
                                                "defaultarg": 3,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "end": {
                                                "attrOrProp": 1,
                                                "digest": "End index (samples).",
                                                "defaultarg": 4,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "-1"
                                            },
                                            "offset": {
                                                "attrOrProp": 1,
                                                "digest": "Channel offset (zero-based).",
                                                "defaultarg": 5,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "Sampled value at channel 1.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "outindex": {
                                                "attrOrProp": 1,
                                                "digest": "Index (in samples).",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "buffer": {
                                                "attrOrProp": 1,
                                                "digest": "If multiple buffer names are declared to be used, this sets the currently active buffer using an index [0 based].",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "buffername": {
                                                "attrOrProp": 2,
                                                "digest": "Buffer to use.",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "mandatory": 1
                                            },
                                            "channels": {
                                                "attrOrProp": 2,
                                                "digest": "Number of channels",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "1"
                                            },
                                            "boundmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the bound mode for input sample values",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "fold", "clamp", "clip", "wrap", "mirror", "ignore" ],
                                                "type": "enum",
                                                "defaultValue": "wrap"
                                            },
                                            "channelmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the bound mode for input channel values",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "fold", "clamp", "clip", "wrap", "mirror", "ignore" ],
                                                "type": "enum",
                                                "defaultValue": "wrap"
                                            },
                                            "indexmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the lookup mode for values in the buffer",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "phase", "samples", "signal", "lookup", "wave" ],
                                                "type": "enum",
                                                "defaultValue": "wave"
                                            },
                                            "interp": {
                                                "attrOrProp": 2,
                                                "digest": "Set the type of interpolation to use when reading samples from the buffer.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "linear", "cubic", "spline", "cosine", "step", "none", "fastcubic", "spline6" ],
                                                "type": "enum",
                                                "defaultValue": "linear"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "phase",
                                                "type": "auto",
                                                "digest": "Phase to read (0..1, between start and end).",
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "start",
                                                "type": "auto",
                                                "digest": "Start index (samples)",
                                                "defaultarg": 3,
                                                "docked": 0
                                            },
                                            {
                                                "name": "end",
                                                "type": "auto",
                                                "digest": "End index (samples).",
                                                "defaultarg": 4,
                                                "docked": 0
                                            },
                                            {
                                                "name": "offset",
                                                "type": "auto",
                                                "digest": "Channel offset (zero-based).",
                                                "defaultarg": 5,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "signal",
                                                "digest": "Sampled value at channel 1.",
                                                "docked": 0
                                            },
                                            {
                                                "name": "outindex",
                                                "type": "signal",
                                                "digest": "Index (in samples).",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "wave~",
                                        "aliasOf": "wave~",
                                        "classname": "wave~",
                                        "operator": 0,
                                        "versionId": 1386487203,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "wave~ pattern @indexmode 1"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-17",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "" ],
                                    "patching_rect": [ 147.48274666070938, 288.2758423089981, 41.0, 23.0 ],
                                    "rnbo_classname": "edge~",
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "edge~_obj-17",
                                    "text": "edge~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-18",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 147.48274666070938, 252.41377580165863, 42.0, 23.0 ],
                                    "rnbo_classname": ">~",
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": ">~_obj-18",
                                    "text": ">~ 0.5"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-16",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 264.8275680541992, 459.31031334400177, 118.0, 23.0 ],
                                    "rnbo_classname": "translate",
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "translate_obj-16",
                                    "text": "translate samples ms"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-14",
                                    "maxclass": "newobj",
                                    "numinlets": 4,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 174.48274666070938, 497.2413452267647, 109.34482139348984, 23.0 ],
                                    "rnbo_classname": "pak",
                                    "rnbo_extra_attributes": {
                                        "list": "",
                                        "length": 0.0
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "pak_obj-14",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "out": {
                                                "attrOrProp": 1,
                                                "digest": "out",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "list"
                                            },
                                            "in1": {
                                                "attrOrProp": 1,
                                                "digest": "number to be list element 1",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "in2": {
                                                "attrOrProp": 1,
                                                "digest": "number to be list element 2",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "in3": {
                                                "attrOrProp": 1,
                                                "digest": "number to be list element 3",
                                                "defaultarg": 3,
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "in4": {
                                                "attrOrProp": 1,
                                                "digest": "number to be list element 4",
                                                "defaultarg": 4,
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "length": {
                                                "attrOrProp": 2,
                                                "digest": "how many things to pack",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number"
                                            },
                                            "list": {
                                                "attrOrProp": 2,
                                                "digest": "the list to initialize the {@objectname} object with",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "list"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "in1",
                                                "type": [ "number", "bang" ],
                                                "digest": "number to be list element 1",
                                                "defaultarg": 1,
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "in2",
                                                "type": [ "number", "bang" ],
                                                "digest": "number to be list element 2",
                                                "defaultarg": 2,
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "in3",
                                                "type": [ "number", "bang" ],
                                                "digest": "number to be list element 3",
                                                "defaultarg": 3,
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "in4",
                                                "type": [ "number", "bang" ],
                                                "digest": "number to be list element 4",
                                                "defaultarg": 4,
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "out",
                                                "type": "list",
                                                "digest": "out",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "pak",
                                        "aliasOf": "pack",
                                        "classname": "pak",
                                        "operator": 0,
                                        "versionId": 1331432417,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "pak 0. 0. 1. 1."
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-13",
                                    "maxclass": "message",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 147.48274666070938, 536.5516873598099, 46.0, 23.0 ],
                                    "rnbo_classname": "message",
                                    "rnbo_extra_attributes": {
                                        "storeempty": 0,
                                        "text": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "message_obj-13",
                                    "text": "0 0 1 0"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-11",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "" ],
                                    "patching_rect": [ 147.48274666070938, 575.8620294928551, 34.0, 23.0 ],
                                    "rnbo_classname": "line~",
                                    "rnbo_extra_attributes": {
                                        "value": 0.0
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "line~_obj-11",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "segments": {
                                                "attrOrProp": 1,
                                                "digest": "Target value or target value/ramp time pairs",
                                                "isalias": 0,
                                                "aliases": [ "dest" ],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "list",
                                                "defaultValue": ""
                                            },
                                            "dest": {
                                                "attrOrProp": 1,
                                                "digest": "Target value or target value/ramp time pairs",
                                                "isalias": 1,
                                                "aliasOf": "segments",
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "list",
                                                "defaultValue": ""
                                            },
                                            "time": {
                                                "attrOrProp": 1,
                                                "digest": "Ramp time",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "keepramp": {
                                                "attrOrProp": 1,
                                                "digest": "Keep last ramp",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bool",
                                                "defaultValue": "false"
                                            },
                                            "out": {
                                                "attrOrProp": 1,
                                                "digest": "Ramp out",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "target": {
                                                "attrOrProp": 1,
                                                "digest": "Bang when ramp has finished",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "bang"
                                            },
                                            "value": {
                                                "attrOrProp": 2,
                                                "digest": "Initial value.",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "segments",
                                                "type": "list",
                                                "digest": "Target value or target value/ramp time pairs",
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "time",
                                                "type": "number",
                                                "digest": "Ramp time",
                                                "defaultarg": 2,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "out",
                                                "type": "signal",
                                                "digest": "Ramp out",
                                                "docked": 0
                                            },
                                            {
                                                "name": "target",
                                                "type": "bang",
                                                "digest": "Bang when ramp has finished",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "line~",
                                        "aliasOf": "line~",
                                        "classname": "line~",
                                        "operator": 0,
                                        "versionId": 2134689829,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "line~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-10",
                                    "maxclass": "newobj",
                                    "numinlets": 0,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 147.48274666070938, 211.72412341833115, 156.0, 23.0 ],
                                    "rnbo_classname": "in~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "in~_obj-10",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "signal from inlet with index 2",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "inlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "signal",
                                                "digest": "signal from inlet with index 2",
                                                "displayName": "trigger in",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "in~",
                                        "aliasOf": "in~",
                                        "classname": "in~",
                                        "operator": 0,
                                        "versionId": -1654556303,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "in~ 2 @comment \"trigger in\""
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-9",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 393.28568810224533, 399.367129445076, 30.0, 23.0 ],
                                    "rnbo_classname": "sig~",
                                    "rnbo_extra_attributes": {
                                        "unit": "ms"
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "sig~_obj-9",
                                    "text": "sig~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-3",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 752.0, 525.0, 197.0, 23.0 ],
                                    "rnbo_classname": "out~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "out~_obj-3",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "in1": {
                                                "attrOrProp": 1,
                                                "digest": "signal sent to outlet with index 2",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "outlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "in1",
                                                "type": "signal",
                                                "digest": "signal sent to outlet with index 2",
                                                "displayName": "output (trigger)",
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [],
                                        "helpname": "out~",
                                        "aliasOf": "out~",
                                        "classname": "out~",
                                        "operator": 0,
                                        "versionId": 1989326771,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "out~ 2 @comment \"output (trigger)\""
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-5",
                                    "maxclass": "newobj",
                                    "numinlets": 0,
                                    "numoutlets": 1,
                                    "outlettype": [ "" ],
                                    "patching_rect": [ 393.10342133045197, 295.17239356040955, 82.0, 23.0 ],
                                    "rnbo_classname": "inport",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "inport_obj-5",
                                    "text": "inport pattern"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-15",
                                    "maxclass": "newobj",
                                    "numinlets": 4,
                                    "numoutlets": 2,
                                    "outlettype": [ "signal", "signal" ],
                                    "patching_rect": [ 552.0, 399.367129445076, 139.0, 23.0 ],
                                    "rnbo_classname": "wave~",
                                    "rnbo_extra_attributes": {
                                        "indexmode": "wave",
                                        "channels": 1.0,
                                        "boundmode": "wrap",
                                        "channelmode": "wrap"
                                    },
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "wave~_obj-15",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "phase": {
                                                "attrOrProp": 1,
                                                "digest": "Phase to read (0..1, between start and end).",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number"
                                            },
                                            "start": {
                                                "attrOrProp": 1,
                                                "digest": "Start index (samples)",
                                                "defaultarg": 3,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "end": {
                                                "attrOrProp": 1,
                                                "digest": "End index (samples).",
                                                "defaultarg": 4,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "-1"
                                            },
                                            "offset": {
                                                "attrOrProp": 1,
                                                "digest": "Channel offset (zero-based).",
                                                "defaultarg": 5,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "Sampled value at channel 1.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "outindex": {
                                                "attrOrProp": 1,
                                                "digest": "Index (in samples).",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "buffer": {
                                                "attrOrProp": 1,
                                                "digest": "If multiple buffer names are declared to be used, this sets the currently active buffer using an index [0 based].",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "buffername": {
                                                "attrOrProp": 2,
                                                "digest": "Buffer to use.",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "mandatory": 1
                                            },
                                            "channels": {
                                                "attrOrProp": 2,
                                                "digest": "Number of channels",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "1"
                                            },
                                            "boundmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the bound mode for input sample values",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "fold", "clamp", "clip", "wrap", "mirror", "ignore" ],
                                                "type": "enum",
                                                "defaultValue": "wrap"
                                            },
                                            "channelmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the bound mode for input channel values",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "fold", "clamp", "clip", "wrap", "mirror", "ignore" ],
                                                "type": "enum",
                                                "defaultValue": "wrap"
                                            },
                                            "indexmode": {
                                                "attrOrProp": 2,
                                                "digest": "Set the lookup mode for values in the buffer",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "phase", "samples", "signal", "lookup", "wave" ],
                                                "type": "enum",
                                                "defaultValue": "wave"
                                            },
                                            "interp": {
                                                "attrOrProp": 2,
                                                "digest": "Set the type of interpolation to use when reading samples from the buffer.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "enum": [ "linear", "cubic", "spline", "cosine", "step", "none", "fastcubic", "spline6" ],
                                                "type": "enum",
                                                "defaultValue": "linear"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "phase",
                                                "type": "auto",
                                                "digest": "Phase to read (0..1, between start and end).",
                                                "hot": 1,
                                                "docked": 0
                                            },
                                            {
                                                "name": "start",
                                                "type": "auto",
                                                "digest": "Start index (samples)",
                                                "defaultarg": 3,
                                                "docked": 0
                                            },
                                            {
                                                "name": "end",
                                                "type": "auto",
                                                "digest": "End index (samples).",
                                                "defaultarg": 4,
                                                "docked": 0
                                            },
                                            {
                                                "name": "offset",
                                                "type": "auto",
                                                "digest": "Channel offset (zero-based).",
                                                "defaultarg": 5,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "signal",
                                                "digest": "Sampled value at channel 1.",
                                                "docked": 0
                                            },
                                            {
                                                "name": "outindex",
                                                "type": "signal",
                                                "digest": "Index (in samples).",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "wave~",
                                        "aliasOf": "wave~",
                                        "classname": "wave~",
                                        "operator": 0,
                                        "versionId": 1386487203,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "wave~ pattern @interp 5"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-6",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 3,
                                    "outlettype": [ "", "", "" ],
                                    "patching_rect": [ 393.10342133045197, 335.1723908185959, 89.0, 23.0 ],
                                    "rnbo_classname": "buffer~",
                                    "rnbo_extra_attributes": {
                                        "meta": "",
                                        "samplerate": 0.0,
                                        "file": "",
                                        "type": "",
                                        "preset": 0,
                                        "fill": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "buffer~_obj-6",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "info": {
                                                "attrOrProp": 1,
                                                "digest": "Bang to report buffer information.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "bang"
                                            },
                                            "sizeout": {
                                                "attrOrProp": 1,
                                                "digest": "Size in Samples",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "chanout": {
                                                "attrOrProp": 1,
                                                "digest": "Number of Channels",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "srout": {
                                                "attrOrProp": 1,
                                                "digest": "Sample rate",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "size": {
                                                "attrOrProp": 1,
                                                "digest": "Size in Samples. Take care when setting, allocation might block audio processing.",
                                                "defaultarg": 2,
                                                "isalias": 0,
                                                "aliases": [ "samples" ],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "samples": {
                                                "attrOrProp": 1,
                                                "digest": "Size in Samples. Take care when setting, allocation might block audio processing.",
                                                "defaultarg": 2,
                                                "isalias": 1,
                                                "aliasOf": "size",
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "sizems": {
                                                "attrOrProp": 1,
                                                "digest": "Size in Milliseconds. Take care when setting, allocation might block audio processing.",
                                                "isalias": 0,
                                                "aliases": [ "ms" ],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "ms": {
                                                "attrOrProp": 1,
                                                "digest": "Size in Milliseconds. Take care when setting, allocation might block audio processing.",
                                                "isalias": 1,
                                                "aliasOf": "sizems",
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "clear": {
                                                "attrOrProp": 1,
                                                "digest": "Clear the contents of the buffer",
                                                "isalias": 0,
                                                "aliases": [],
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bang"
                                            },
                                            "normalize": {
                                                "attrOrProp": 1,
                                                "digest": "Find Maximum and normalize to the value given.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0.995"
                                            },
                                            "channels": {
                                                "attrOrProp": 1,
                                                "digest": "Change channel count. Take care when setting, allocation might block audio processing.",
                                                "defaultarg": 3,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 1,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "1"
                                            },
                                            "name": {
                                                "attrOrProp": 2,
                                                "digest": "Name of the data buffer",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "mandatory": 1
                                            },
                                            "file": {
                                                "attrOrProp": 2,
                                                "digest": "File name/path or URL to load into buffer.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "type": {
                                                "attrOrProp": 2,
                                                "digest": "Type of Data (float32, float64)",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "samplerate": {
                                                "attrOrProp": 2,
                                                "digest": "Sample rate",
                                                "defaultarg": 4,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "defaultValue": "0"
                                            },
                                            "fill": {
                                                "attrOrProp": 2,
                                                "digest": "Fill expression, this could be a value, or a simple function like sin(x), where x will run from 0 to 1 to fill the buffer.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "external": {
                                                "attrOrProp": 2,
                                                "digest": "Await data from the outside world.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bool",
                                                "doNotShowInMaxInspector": 1
                                            },
                                            "preset": {
                                                "attrOrProp": 2,
                                                "digest": "Add this value to the preset.",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "bool",
                                                "defaultValue": "false",
                                                "label": "Include In Preset",
                                                "category": "Preset"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata"
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "info",
                                                "type": "bang",
                                                "digest": "Bang to report buffer information.",
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [
                                            {
                                                "name": "sizeout",
                                                "type": "number",
                                                "digest": "Size in Samples",
                                                "defaultarg": 2,
                                                "docked": 0
                                            },
                                            {
                                                "name": "chanout",
                                                "type": "number",
                                                "digest": "Number of Channels",
                                                "docked": 0
                                            },
                                            {
                                                "name": "srout",
                                                "type": "number",
                                                "digest": "Sample rate",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "buffer~",
                                        "aliasOf": "data",
                                        "classname": "buffer~",
                                        "operator": 0,
                                        "versionId": -72996304,
                                        "changesPatcherIO": 0
                                    },
                                    "text": "buffer~ pattern"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-21",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 2,
                                    "outlettype": [ "", "" ],
                                    "patching_rect": [ 1052.3179686069489, 385.8296592235565, 41.0, 23.0 ],
                                    "rnbo_classname": "edge~",
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "edge~_obj-21",
                                    "text": "edge~"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-20",
                                    "maxclass": "newobj",
                                    "numinlets": 2,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 1052.3179686069489, 350.06806683540344, 42.0, 23.0 ],
                                    "rnbo_classname": ">~",
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": ">~_obj-20",
                                    "text": ">~ 0.5"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-7",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 1052.3179686069489, 465.29986453056335, 81.0, 23.0 ],
                                    "rnbo_classname": "outport",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 1,
                                    "rnbo_uniqueid": "outport_obj-7",
                                    "text": "outport regen"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-4",
                                    "maxclass": "newobj",
                                    "numinlets": 0,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 1052.3179686069489, 310.3329641819, 130.0, 23.0 ],
                                    "rnbo_classname": "in~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 2,
                                    "rnbo_uniqueid": "in~_obj-4",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "signal from inlet with index 3",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "inlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "signal",
                                                "digest": "signal from inlet with index 3",
                                                "displayName": "regen",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "in~",
                                        "aliasOf": "in~",
                                        "classname": "in~",
                                        "operator": 0,
                                        "versionId": -1654556303,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "in~ 3 @comment regen"
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-2",
                                    "maxclass": "newobj",
                                    "numinlets": 1,
                                    "numoutlets": 0,
                                    "patching_rect": [ 552.0, 525.0, 193.0, 23.0 ],
                                    "rnbo_classname": "out~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 3,
                                    "rnbo_uniqueid": "out~_obj-2",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "in1": {
                                                "attrOrProp": 1,
                                                "digest": "signal sent to outlet with index 1",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "inlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "outlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [
                                            {
                                                "name": "in1",
                                                "type": "signal",
                                                "digest": "signal sent to outlet with index 1",
                                                "displayName": "output (phase)",
                                                "hot": 1,
                                                "docked": 0
                                            }
                                        ],
                                        "outputs": [],
                                        "helpname": "out~",
                                        "aliasOf": "out~",
                                        "classname": "out~",
                                        "operator": 0,
                                        "versionId": 1989326771,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "out~ 1 @comment \"output (phase)\""
                                }
                            },
                            {
                                "box": {
                                    "id": "obj-1",
                                    "maxclass": "newobj",
                                    "numinlets": 0,
                                    "numoutlets": 1,
                                    "outlettype": [ "signal" ],
                                    "patching_rect": [ 552.0, 310.0, 132.0, 23.0 ],
                                    "rnbo_classname": "in~",
                                    "rnbo_extra_attributes": {
                                        "meta": ""
                                    },
                                    "rnbo_serial": 3,
                                    "rnbo_uniqueid": "in~_obj-1",
                                    "rnboinfo": {
                                        "needsInstanceInfo": 1,
                                        "argnames": {
                                            "out1": {
                                                "attrOrProp": 1,
                                                "digest": "signal from inlet with index 1",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 0,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "outlet": 1,
                                                "type": "signal"
                                            },
                                            "index": {
                                                "attrOrProp": 2,
                                                "digest": "inlet number",
                                                "defaultarg": 1,
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "number",
                                                "mandatory": 1
                                            },
                                            "comment": {
                                                "attrOrProp": 2,
                                                "digest": "mouse over comment",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol"
                                            },
                                            "meta": {
                                                "attrOrProp": 2,
                                                "digest": "A JSON formatted string containing metadata for use by the exported code",
                                                "isalias": 0,
                                                "aliases": [],
                                                "settable": 1,
                                                "attachable": 0,
                                                "isparam": 0,
                                                "deprecated": 0,
                                                "touched": 0,
                                                "type": "symbol",
                                                "defaultValue": "",
                                                "label": "Metadata",
                                                "displayorder": 3
                                            }
                                        },
                                        "inputs": [],
                                        "outputs": [
                                            {
                                                "name": "out1",
                                                "type": "signal",
                                                "digest": "signal from inlet with index 1",
                                                "displayName": "phase",
                                                "docked": 0
                                            }
                                        ],
                                        "helpname": "in~",
                                        "aliasOf": "in~",
                                        "classname": "in~",
                                        "operator": 0,
                                        "versionId": -1654556303,
                                        "changesPatcherIO": 1
                                    },
                                    "text": "in~ 1 @comment phase"
                                }
                            }
                        ],
                        "lines": [
                            {
                                "patchline": {
                                    "destination": [ "obj-26", 0 ],
                                    "source": [ "obj-1", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-18", 0 ],
                                    "source": [ "obj-10", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-19", 0 ],
                                    "midpoints": [ 156.98274666070938, 614.4006915437494, 439.0, 614.4006915437494, 439.0, 386.0, 471.56893384456635, 386.0 ],
                                    "source": [ "obj-11", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-11", 0 ],
                                    "source": [ "obj-13", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-13", 1 ],
                                    "source": [ "obj-14", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-2", 0 ],
                                    "source": [ "obj-15", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-14", 3 ],
                                    "source": [ "obj-16", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-13", 0 ],
                                    "source": [ "obj-17", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-17", 0 ],
                                    "source": [ "obj-18", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-3", 0 ],
                                    "midpoints": [ 471.56893384456635, 479.41415591802433, 761.5, 479.41415591802433 ],
                                    "source": [ "obj-19", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-21", 0 ],
                                    "source": [ "obj-20", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-24", 0 ],
                                    "source": [ "obj-21", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-13", 1 ],
                                    "midpoints": [ 306.741358935833, 530.3448255062103, 183.98274666070938, 530.3448255062103 ],
                                    "source": [ "obj-22", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-7", 0 ],
                                    "source": [ "obj-24", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-16", 0 ],
                                    "midpoints": [ 297.7758423089981, 454.3448255062103, 274.3275680541992, 454.3448255062103 ],
                                    "source": [ "obj-25", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-15", 0 ],
                                    "source": [ "obj-26", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-14", 2 ],
                                    "source": [ "obj-33", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-20", 0 ],
                                    "source": [ "obj-4", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-16", 0 ],
                                    "midpoints": [ 402.60342133045197, 385.0, 274.3275680541992, 385.0 ],
                                    "order": 2,
                                    "source": [ "obj-6", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-25", 0 ],
                                    "midpoints": [ 402.60342133045197, 386.0, 297.7758423089981, 386.0 ],
                                    "order": 1,
                                    "source": [ "obj-6", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-33", 0 ],
                                    "midpoints": [ 402.60342133045197, 384.8800921527436, 243.9827425479889, 384.8800921527436 ],
                                    "order": 3,
                                    "source": [ "obj-6", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-9", 0 ],
                                    "order": 0,
                                    "source": [ "obj-6", 0 ]
                                }
                            },
                            {
                                "patchline": {
                                    "destination": [ "obj-12", 0 ],
                                    "midpoints": [ 402.78568810224533, 494.70873101315374, 979.5, 494.70873101315374 ],
                                    "source": [ "obj-9", 0 ]
                                }
                            }
                        ],
                        "export_config": {
                            "web-export": {
                                "json-web-export": {
                                    "file_name": "pattern.json"
                                }
                            }
                        }
                    },
                    "patching_rect": [ 286.0, 160.0, 40.0, 22.0 ],
                    "rnboattrcache": {                    },
                    "rnboversion": "1.4.2",
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_invisible": 1,
                            "parameter_longname": "rnbo~",
                            "parameter_modmode": 0,
                            "parameter_shortname": "rnbo~",
                            "parameter_type": 3
                        }
                    },
                    "saved_object_attributes": {
                        "optimization": "O1",
                        "parameter_enable": 1,
                        "uuid": "290a2c8b-bde5-11ee-ac8b-acde48001122"
                    },
                    "snapshot": {
                        "filetype": "C74Snapshot",
                        "version": 2,
                        "minorversion": 0,
                        "name": "snapshotlist",
                        "origin": "rnbo~",
                        "type": "list",
                        "subtype": "Undefined",
                        "embed": 1,
                        "snapshot": {
                            "__presetid": "290a2c8b-bde5-11ee-ac8b-acde48001122"
                        },
                        "snapshotlist": {
                            "current_snapshot": 0,
                            "entries": [
                                {
                                    "filetype": "C74Snapshot",
                                    "version": 2,
                                    "minorversion": 0,
                                    "name": "untitled",
                                    "origin": "290a2c8b-bde5-11ee-ac8b-acde48001122",
                                    "type": "rnbo",
                                    "subtype": "",
                                    "embed": 1,
                                    "snapshot": {
                                        "__presetid": "290a2c8b-bde5-11ee-ac8b-acde48001122"
                                    },
                                    "fileref": {
                                        "name": "untitled",
                                        "filename": "untitled_20251119.maxsnap",
                                        "filepath": "~/Documents/Max 9/Snapshots",
                                        "filepos": -1,
                                        "snapshotfileid": "f66690b0a406160512658c6604285dba"
                                    }
                                }
                            ]
                        }
                    },
                    "text": "rnbo~",
                    "varname": "rnbo~"
                }
            }
        ],
        "lines": [],
        "parameters": {
            "obj-1": [ "rnbo~", "rnbo~", 0 ],
            "parameterbanks": {
                "0": {
                    "index": 0,
                    "name": "",
                    "parameters": [ "-", "-", "-", "-", "-", "-", "-", "-" ],
                    "buttons": [ "-", "-", "-", "-", "-", "-", "-", "-" ]
                }
            },
            "inherited_shortname": 1
        },
        "autosave": 0
    }
}