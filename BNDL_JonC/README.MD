Alternative Userscript for capture canvas of BN

Brief:
Instead of Duplicating Rendered Canvas, we Hijack drawImage,
and Render canvas ourself

Pros:
- Without double canvas rendering, quality should be higer then BNDL
- exact resolution with source image, so no surrounding white spaces, and no over-chopped mistake


Cons:
- Slower Process by Rendering canvas by userscript
- Need to force userscript run before image-chunks loaded, which causes unstable initialization