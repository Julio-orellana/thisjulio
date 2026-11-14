/**
 * Los 6 shaders de la escena, copiados sin cambios de
 * `docs/design/fuente/Arch3D.dc.html` (spec 003, T3). Son cadenas literales:
 * la CSP no regula la compilación de GLSL y aquí no hay `eval`.
 * `tests/unit/scene3d-shaders.test.ts` los compara con la fuente del diseño.
 */

/** Escena: vértices. */
export const SCENE_VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;attribute vec3 aC;attribute float aL;attribute float aM;
uniform mat4 uVP;uniform mat4 uLVP;uniform float uX;uniform float uY;uniform float uA[7];uniform float uTY[4];
varying vec3 vN;varying vec3 vP;varying vec2 vU;varying vec3 vC;varying float vM;varying float vA;varying vec4 vS;varying float vT;varying float vH;
void main(){vN=aN;vP=aP;vU=aU;vC=aC;vM=aM;vT=aL;int l=int(aL+.5);vA=uA[l];vH=1.;if(l<4)vH=aP.y-uTY[l];vS=uLVP*vec4(aP,1.);
vec4 c=uVP*vec4(aP,1.);c.x+=uX*c.w;c.y+=uY*c.w;gl_Position=c;}`;

const SCENE_FS_HEAD = `#extension GL_OES_standard_derivatives : enable
precision highp float;
`;

const SCENE_FS_BODY = `uniform vec3 uE;uniform sampler2D uTex;uniform sampler2D uSM;uniform sampler2D uAO;uniform float uT;uniform vec3 uBg;uniform float uSR;
varying vec3 vN;varying vec3 vP;varying vec2 vU;varying vec3 vC;varying float vM;varying float vA;varying vec4 vS;varying float vT;varying float vH;
float unpack(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float shadow(){
  vec3 p=vS.xyz/vS.w*.5+.5;
  if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return 1.;
  float s=0.;
  for(int i=0;i<TAPS;i++){
    float a=float(i)*2.399963;float r=sqrt((float(i)+.5)/float(TAPS))*uSR;
    s+=unpack(texture2D(uSM,p.xy+vec2(cos(a),sin(a))*r))<p.z-.0014?0.:1.;
  }
  return s/float(TAPS);
}
vec3 env(vec3 d,vec3 p){
  vec3 c=mix(vec3(.01,.012,.018),vec3(.055,.075,.11),smoothstep(-.3,1.,d.y));
  if(d.y>.02){float t=(9.-p.y)/d.y;vec2 q=p.xz+d.xz*t;
    vec2 e=abs(q-vec2(-2.5,-3.))-vec2(4.,2.4);c+=vec3(.75,.85,1.)*smoothstep(1.2,-.3,max(e.x,e.y))*.8;}
  c+=vec3(.25,.55,.75)*pow(max(dot(d,normalize(vec3(.9,.1,-.3))),0.),14.)*.5;
  return c;
}
float edgePx(vec2 u){vec2 w=fwidth(u)+1e-5;vec2 e=min(u,1.-u);return min(e.x/w.x,e.y/w.y);}
void main(){
  float m=vM;vec3 V=normalize(uE-vP);vec3 N=normalize(vN);
  if(dot(N,V)<0.&&m>.5&&m<1.5)N=-N;
  float nv=max(dot(N,V),0.);float fr=pow(1.-nv,4.);
  vec3 R=reflect(-V,N);
  vec3 col=vec3(0.);float a=1.;
  if(m<.5){
    float sh=shadow();
    vec3 L=normalize(vec3(-.35,.85,.4)),L2=normalize(vec3(.75,.25,.55));
    float d=max(dot(N,L),0.),d2=max(dot(N,L2),0.);
    float sp=pow(max(dot(N,normalize(L+V)),0.),110.),sp2=pow(max(dot(N,normalize(L2+V)),0.),36.);
    float ao=mix(.42,1.,smoothstep(0.,.3,vH));
    float F=.08+.92*pow(1.-nv,5.);
    col=vC*(.15*ao+.64*d*mix(.4,1.,sh)+.16*d2)+env(R,vP)*(F+.13)*mix(.55,1.,sh)*ao;
    col+=vec3(.9,.95,1.)*sp*.55*sh+vec3(.35,.72,.9)*sp2*.12;
    float px=edgePx(vU);
    float edge=1.-smoothstep(.5,1.7,px);
    col+=vec3(.2,.25,.33)*edge*(.45+.55*max(d,d2));
    if(abs(N.y)>.5){
      vec2 w=fwidth(vU)+1e-5;vec2 e=min(vU,1.-vU);
      float inset=min(abs(e.x-.07)/w.x+step(e.y,.07)*99.,abs(e.y-.09)/w.y+step(e.x,.05)*99.);
      col+=vec3(.05,.065,.09)*(1.-smoothstep(.4,1.3,inset))*step(max(w.x,w.y),.05);
    }
    col*=mix(.42,1.,vA);
    col-=max(col-.82,0.)*.6;
  }else if(m<1.5){
    bool top=abs(N.y)>.5;
    if(top&&N.y<0.&&uE.y>vP.y)discard;
    vec2 u=vU;float bright=mix(.25,1.,vA);
    if(top){
      vec2 gu=u*vec2(14.,10.);vec2 w=fwidth(gu)+1e-5;
      vec2 g=abs(fract(gu)-.5)/w;
      float grid=(1.-smoothstep(.25,1.25,min(g.x,g.y)))*smoothstep(.5,.08,max(w.x,w.y));
      float px=edgePx(u);
      float edge=1.-smoothstep(.7,2.1,px);
      float halo=exp(-px*.11)*.16;
      float sh=shadow();
      float ao=texture2D(uAO,vec2(u.x,(vT+u.y)/4.)).r;
      float occ=sh*ao;
      col=env(R,vP)*(.05+.7*fr)*occ+vC*(.03+.17*grid)*bright*occ+vC*(.92*edge+halo)*bright;
      a=(.12+.5*fr+.17*grid+.92*edge+halo)*mix(.5,1.,vA);
      a=max(a,(1.-occ)*.62);
    }else{col=vC*1.05*bright;a=.9*mix(.5,1.,vA);}
  }else if(m<2.5){
    vec4 t=texture2D(uTex,vU,-.8);
    col=t.rgb*mix(.3,1.12,vA)+env(R,vP)*(.025+.3*fr)*t.a*mix(.5,1.,vA);a=t.a*mix(.5,1.,vA);
  }else if(m<3.5){
    col=vC*mix(.32,1.2,vA);
  }else if(m<4.5){
    float p=fract(vU.x*.55-uT*.34);float head=smoothstep(.76,1.,p);
    col=vC*(.38+1.7*head)*mix(.22,1.,vA);a=mix(.3,1.,vA);
  }else if(m<5.5){
    float sp=pow(max(dot(N,normalize(normalize(vec3(-.35,.85,.4))+V)),0.),140.);
    float r3=pow(1.-nv,3.);
    col=(vC*.09+env(R,vP)*.3+vec3(.5,.75,1.)*r3*.72+vec3(1.)*sp*.7)*mix(.45,1.,vA);
  }else{
    vec2 q=vU*.5;vec2 w=fwidth(q)+1e-5;vec2 g=abs(fract(q)-.5)/w;
    float l=(1.-smoothstep(.2,1.2,min(g.x,g.y)))*smoothstep(.5,.06,max(w.x,w.y));
    float d=length(vP.xz);float f=smoothstep(10.,2.5,d);
    col=uBg+(vec3(.05,.1,.16)*l*f*.6+vec3(.02,.05,.09)*smoothstep(7.,.5,d)*.7)*mix(.45,1.,shadow());
  }
  gl_FragColor=vec4(col,a);
}`;

/** Escena: fragmentos. `taps` son las muestras del filtro de sombras del perfil. */
export const sceneFragmentShader = (taps: number): string => `${SCENE_FS_HEAD}#define TAPS ${taps}\n${SCENE_FS_BODY}`;

/** Mapa de sombras: profundidad empaquetada en RGBA. */
export const DEPTH_VS = `attribute vec3 aP;uniform mat4 uLVP;void main(){gl_Position=uLVP*vec4(aP,1.);}`;
export const DEPTH_FS = `precision highp float;void main(){vec4 e=fract(gl_FragCoord.z*vec4(1.,255.,65025.,16581375.));e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=e;}`;

/** Pulsos de luz que viajan por las rutas de datos. */
export const GLOW_VS = `attribute vec3 aP;attribute vec4 aK;uniform mat4 uVP;uniform float uX;uniform float uY;uniform float uS;varying vec3 vC;
void main(){vec4 c=uVP*vec4(aP,1.);c.x+=uX*c.w;c.y+=uY*c.w;gl_Position=c;gl_PointSize=uS*aK.w;vC=aK.rgb;}`;
export const GLOW_FS = `precision mediump float;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5)*2.;float h=max(1.-d,0.);h=h*h*h;float c=1.-smoothstep(.2,.34,d);gl_FragColor=vec4(vC*(h*.5+c*.8)+vec3(.1)*c,1.);}`;
