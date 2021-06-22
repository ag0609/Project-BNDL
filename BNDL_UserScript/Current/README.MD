BNDL.user.js - Deprecated. Single version of BNDL only support BN(or BW).

BNDL_P.user.js - Deprecated. Plugin supported BNDL. Support multiple HTML5 Reader(In Future...Maybe)

Plugin Status:

bookwalkerjp - Stable. Plugin will search and collect book detail(with accuracy 85% and no R18 support yet), then generate ComicInfo.xml(mainly used by ComicRack).
==> 'b9b' is official image bitmap mapping method, so it should be the best method to go. 'b9b' not working anymore at 01-Apr-2021. need finding its new address.
==> 'Hijacking drawCanvas' is the most basic way to go, but comparing with 'b9b', Hijacking always provide lower output quality(2 rounds of encoding of <canvas>), much x2 heavier resource consumption(sometimes will make browser crash), no guarantee of accuracy(wrong page[duplicate or blank] output).

dlsitejp - Very unstable. add hook at XMLHttpRequest to parse ztree.json and override Canvas rendering, hijacking image source, high usage of system memory and only degraded image(1280x???) can be captured. Also it quite narrow range usage(only useful when facing DRM enabled products, most of the image products don't use DRM protects so just download its HQ sources). Now experimentally support Online covert non-DRM PDF product to Zipped Jpg archive, but beware it will used up at least 2GB ram for a 100mb pdf, almost impossible when facing a 300+mb PDF(Chrome will crush when used up 5GB RAM)

booklivejp - On developemnet, no automation. it splits image to 3 equivalent parts. use MutationObserver to detect content loads, and combine image fregments to whole one.
