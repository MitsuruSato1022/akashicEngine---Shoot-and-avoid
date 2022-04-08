let characters = {}; // キャラクタ管理テーブル
let balls = []; // ボール管理テーブル
function main(param) {
	let scene = new g.Scene({
		game: g.game,
		assetIds: ["chara", "b_06", "b_05", "b_04", "b_03", "c_05", "c_06", "c_07", "c_08", "c_01"]
	});
	scene.onLoad.add(function () {
		makeWall(scene);
		makePlayer(scene);
	});
	scene.onUpdate.add(() => {
	});
	g.game.pushScene(scene);
}
function makePlayer(scene) {
	scene.onPointDownCapture.add(function (ev) {
		// プレイヤー数を４人までとする
		const playerNum = Object.keys(characters).length + 1;
		if (playerNum >= 4) return;
		const playerId = ev.player.id; // 押したプレイヤーのID
		let x, y;
		// 画像の指定
		let playerImg = "b_06";
		let ballImg = "c_05";
		if (playerNum === 2) {
			playerImg = "b_05";
			ballImg = "c_06";
		}
		if (playerNum === 3) {
			playerImg = "b_04";
			ballImg = "c_07";
		}
		if (playerNum === 4) {
			playerImg = "b_03";
			ballImg = "c_08";
		}
		// （コピペ）
		x = ev.point.x; // 押された位置のX座標
		y = ev.point.y; // 押された位置のX座標
		// 移動範囲の制限（壁にめり込んで弾を避けないように）
		if (x < 60) x = 60;
		if (x > g.game.width - 60) x = g.game.width - 60;
		if (y < 60) y = 60;
		if (y > g.game.height - 60) y = g.game.height - 60;

		if (characters[playerId] == null) {
			// （コピペ）プレイヤー playerId にとって初めての操作の場合: キャラクタデータを生成
			let chara = {
				id: playerId,
				playerNum: playerNum,
				targetX: x,
				targetY: y,
				x: x,
				y: y,
				point: 0,
				ballImg: ballImg,
				ballDeg: g.game.random.generate() * 360,
				dead: false,
				// プレイヤーエンティティ生成
				entity: new g.Sprite({
					scene: scene,
					src: scene.asset.getImageById(playerImg),
					x: x,
					y: y,
					width: 32,
					height: 32
				}),
				// 弾を撃つ方向を示すエンティティ生成
				arrow: new g.Sprite({
					scene: scene,
					src: scene.asset.getImageById("c_01"),
					x: x,
					y: y
				}),
			};
			characters[playerId] = chara;
			makePoint(scene, playerId);
			// （コピペ）キャラクタのフレームごとの処理(目標座標 (targetX, targetY) に近づくように位置を更新)を登録
			chara.entity.onUpdate.add(function () {
				deadJudge(playerId);
				deadText(scene, playerId, characters[playerId].targetX, characters[playerId].targetY);
				if (chara.dead === false) {
					// 撃つ方向エンティティを回転させる
					chara.ballDeg += 5;
					let rad = chara.ballDeg * (Math.PI / 180);
					const initDist = 60;
					let arrowPos = {
						x: chara.entity.x + initDist * Math.cos(rad),
						y: chara.entity.y + initDist * Math.sin(rad)
					};
					chara.arrow.x = arrowPos.x;
					chara.arrow.y = arrowPos.y;
					// エンティティの移動に関する記述
					let diffX = chara.targetX - chara.entity.x;
					let diffY = chara.targetY - chara.entity.y;
					// （コピペ）既に目標座標にいるなら何もせず抜ける
					if (diffX === 0 && diffY === 0) {
						return;
					}
					//（コピペ） 目標座標から各軸10px以上離れていたら、1割ずつ接近。10px以下なら目標座標に移動
					chara.entity.x += Math.abs(diffX) > 10 ? Math.floor(diffX / 10) : diffX;
					chara.entity.y += Math.abs(diffY) > 10 ? Math.floor(diffY / 10) : diffY;
					// 変更を反映
					chara.arrow.modified();
					chara.entity.modified();
				}
			});
			scene.append(chara.arrow);
			scene.append(chara.entity); // シーンに生成したキャラクタ画像を追加
		} else if (characters[playerId].dead === false) {
			// （コピペ）プレイヤー playerId のキャラが既にいる場合: キャラの目標座標を、クリックされた位置に更新
			let diffX = x - characters[playerId].entity.x;
			let diffY = y - characters[playerId].entity.y;
			if (Math.abs(diffX) <= 10 && Math.abs(diffY) <= 10) {
				makeBall(scene, characters[playerId].targetX, characters[playerId].targetY, characters[playerId].ballDeg, characters[playerId].ballImg);
				if (characters[playerId].point === null) characters[playerId].point = 0;
				characters[playerId].point++;
			}
			characters[playerId].targetX = x;
			characters[playerId].targetY = y;

		}

	});

}

let left, right, top, bottom;
function makeWall(scene) {
	const size = 20;
	left = new g.FilledRect({
		scene: scene,
		y: size,
		width: size,
		height: g.game.height - size * 2,
		cssColor: "blue"
	});
	right = new g.FilledRect({
		scene: scene,
		x: g.game.width - size,
		y: size,
		width: size,
		height: g.game.height - size * 2,
		cssColor: "red"
	});
	top = new g.FilledRect({
		scene: scene,
		x: size,
		width: g.game.width - size * 2,
		height: size,
		cssColor: "green"
	});
	bottom = new g.FilledRect({
		scene: scene,
		x: size,
		y: g.game.height - size,
		width: g.game.width - size * 2,
		height: size,
		cssColor: "yellow"
	});
	scene.append(left);
	scene.append(right);
	scene.append(top);
	scene.append(bottom);
}
function makeBall(scene, x_, y_, deg, img) {
	// ボールの進行方向
	let rad = deg * (Math.PI / 180);
	// 発射時のプレイヤーとの距離
	const initDist = 60;
	let ballPos = {
		x: x_ + initDist * Math.cos(rad),
		y: y_ + initDist * Math.sin(rad)
	};
	// スピード
	let speed = 5;
	let spX = speed * Math.cos(rad);
	let spY = speed * Math.sin(rad);
	//バウンド時の角度のぶれ幅
	const StrngthAngleChng = Math.PI * 0.1;
	let ball = new g.Sprite({
		scene: scene,
		src: scene.asset.getImageById(img),
		anchorX: 0.5,
		anchorY: 0.5,
		x: ballPos.x,
		y: ballPos.y
	});
	//配列に追加
	balls.push(ball);
	ball.update.add(function () {
		// ボール同士がぶつかったら消滅する
		// 壁との接触判定
		const WallCllsn = {
			left: g.Collision.intersectAreas(ball, left),
			right: g.Collision.intersectAreas(ball, right),
			top: g.Collision.intersectAreas(ball, top),
			bottom: g.Collision.intersectAreas(ball, bottom),
		}
		// 壁と接触した時バウンドする
		if (WallCllsn.left || WallCllsn.right) {
			rad = Math.PI - rad - StrngthAngleChng * 0.5 + g.game.random.generate() * StrngthAngleChng;
		}
		if (WallCllsn.top || WallCllsn.bottom) {
			rad = Math.PI * 2 - rad - StrngthAngleChng * 0.5 + g.game.random.generate() * StrngthAngleChng;
		}
		spX = speed * Math.cos(rad);
		spY = speed * Math.sin(rad);
		ballPos.x += spX;
		ballPos.y += spY;
		// ボールの位置を更新する
		ball.x = ballPos.x;
		ball.y = ballPos.y;
		ball.modified();
	});
	scene.append(ball);
}
// 最後の一人になった時自分が撃った弾数が自分のポイントになる

function makePoint(scene, playerId) {
	let font = new g.DynamicFont({
		game: g.game,
		fontFamily: "sans-serif",
		size: 15
	});
	let label = new g.Label({
		scene: scene,
		font: font,
		text: `${characters[playerId].id}:${characters[playerId].point} point`,
		fontSize: 15,
		textColor: "black",
		x: 100,
		y: 30 * (characters[playerId].playerNum - 1)
	});
	label.onUpdate.add(function () {
		label.text = `${characters[playerId].id}:${characters[playerId].point} point`;
		this.invalidate();
	}, label);
	scene.append(label);
}
function deadJudge(playerId) {
	const chara = characters[playerId];
	const entity = chara.entity;
	const arrow = chara.arrow;
	balls.forEach(function (b) {
		if (g.Collision.intersectAreas(entity, b)) {
			entity.destroy();
			arrow.destroy();
			characters[playerId].dead = true;
			characters[playerId].point = 0;
		}
	});
}
function deadText(scene, playerId, x_, y_) {
	if (characters[playerId].dead === true) {
		let font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 15
		});
		let label = new g.Label({
			scene: scene,
			font: font,
			text: `${playerId} is Dead`,
			fontSize: 15,
			textColor: "black",
			x: x_,
			y: y_
		});

		scene.append(label);
	}
}
module.exports = main;
