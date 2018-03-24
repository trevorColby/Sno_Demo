import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import RegularShape from 'ol/style/regularshape';

export function getMapStyle(feature) {
	if (feature.geometryName_ === 'Point') {
		return new Style({
			image: new RegularShape({
				fill: new Fill({color: 'red'}),
				stroke: new Stroke({
					color: 'black', 
					width: 2
				}),
				points: 4,
				radius: 10,
				angle: Math.PI / 4
			}),
			text: new Text({
				text: String(feature.ol_uid),
				stroke: new Stroke({
					color: '#3399CC',
					width: 1.25
				})
			})
		})
	} else {
		const fill = new Fill({color: 'rgba(255,255,255,0.4)'});
		const stroke = new Stroke({
			color: '#3399CC',
			width: 1.25
		});
		return new Style({
	        image: new Circle({
				fill: fill,
				stroke: stroke,
				radius: 5
	        }),
	        fill: fill,
	        stroke: stroke
		})
	}
}