BNDL.user.js - Deprecated. Single version of BNDL only support BN(or BW).

BNDL_P.user.js - Deprecated. Plugin supported BNDL. Support multiple HTML5 Reader(In Future...Maybe)

Plugin Status:

bookwalkerjp - Stable. Plugin will search and collect book detail(with accuracy 85% and no R18 support yet), then generate ComicInfo.xml(mainly used by ComicRack). using method 'b9b', because it is official method, it is super stable but quite easy to be obsoleted when they updated the script. 
==> 'b9b' not working anymore at 01-Apr-2021. need finding its new address.

dlsitejp - Very unstable. add hook at XMLHttpRequest to parse ztree.json and override Canvas rendering, hijacking image source, high usage of system memory and only degraded image can be captured. Also it quite narrow range usage(only useful when facing DRM enabled products). Now experimentally support Online covert non-DRM PDF product to Zipped Jpg archive, but beware it will used up at least 2GB ram for a 100mb pdf, almost impossible when facing a 300+mb PDF(Chrome will crush when used up 5GB RAM)

booklivejp - On developemnet, no automation. it splits image to 3 equivalent parts. use MutationObserver to detect content loads, and combine image fregments to whole one.
