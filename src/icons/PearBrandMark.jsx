import {
  PEAR_MARK_BACKDROP_RADIUS,
  PEAR_MARK_FRAME_SCALE,
  PEAR_MARK_LAYERS,
  PEAR_MARK_VIEWBOX_HEIGHT,
  PEAR_MARK_VIEWBOX_WIDTH,
  VIEWBOX_CENTER_X,
  VIEWBOX_CENTER_Y,
} from './pearMarkPaths';

export { PEAR_MARK_FRAME_SCALE } from './pearMarkPaths';

/** pear mark — SVG katmanları doğrudan; seasonal dışında beyaz daire zemin. */
export function PearBrandMarkPaths({ fill = 'currentColor', detailFill = '#ffffff' }) {
  return (
    <>
      {PEAR_MARK_LAYERS.map(({ d, role }) => (
        <path key={role} d={d} fill={role === 'main' ? fill : detailFill} />
      ))}
    </>
  );
}

export function PearBrandMarkFramedPaths({
  fill = 'currentColor',
  detailFill = '#ffffff',
  scale = PEAR_MARK_FRAME_SCALE,
  backdrop = false,
  backdropFill = '#ffffff',
}) {
  const cx = VIEWBOX_CENTER_X;
  const cy = VIEWBOX_CENTER_Y;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`}>
      {backdrop ? (
        <circle cx={cx} cy={cy} r={PEAR_MARK_BACKDROP_RADIUS} fill={backdropFill} />
      ) : null}
      <PearBrandMarkPaths fill={fill} detailFill={detailFill} />
    </g>
  );
}

export function PearBrandMark({
  size = 40,
  frameScale = PEAR_MARK_FRAME_SCALE,
  backdrop = false,
  className = '',
  style,
  title,
  ...rest
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${PEAR_MARK_VIEWBOX_WIDTH} ${PEAR_MARK_VIEWBOX_HEIGHT}`}
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden={title != null && title !== '' ? undefined : true}
      role={title != null && title !== '' ? 'img' : undefined}
      {...rest}
    >
      {title != null && title !== '' ? <title>{title}</title> : null}
      <PearBrandMarkFramedPaths fill="currentColor" scale={frameScale} backdrop={backdrop} />
    </svg>
  );
}

export default PearBrandMark;
