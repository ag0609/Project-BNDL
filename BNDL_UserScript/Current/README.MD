BNDL.user.js - Deprecated. Single version of BNDL only support BN(or BW).

BNDL_P.user.js - Plugin supported BNDL. Support multiple HTML5 Reader(In Future...Maybe)

Plugin Status:

bookwalkerjp - No R18 supprt yet, stable in normal store, will search and collect book detail(with accuracy 85%), then generate ComicInfo.xml(mainly used by ComicRack). using method 'b9b', because it is official method, it is super stable but quite easy to be obsoleted when they updated the script.

dlsitejp - Very unstable. add hook at XMLHttpRequest to parse ztree.json and override Canvas rendering, hijacking image source, high usage of system memory and only degraded image can be captured. Also it quite narrow range usage(only useful when DRM enabled)

booklivejp - On developemnet, no automation. it splits image to 3 equivalent parts. use MutationObserver to detect content loads, and combine image fregments to whole one.
