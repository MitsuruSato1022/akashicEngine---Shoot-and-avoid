let characters = {}; // キャラクタ管理テーブル
let balls = []; // キャラクタ管理テーブル
function main(param) {
	let scene = new g.Scene({
		game: g.game,
		assetIds: ["chara", "b_06", "b_05", "b_04", "b_03", "c_05", "c_06", "c_07", "c_08"]
	});

	scene.onLoad.add(function () {
		makeWall(scene);
		makePlayer(scene);
	});
	g.game.pushScene(scene);
}
function makePlayer(scene) {
	scene.onPointDownCapture.add(function (ev) {
		// プレイヤー数を４人までとする
		const idNum = parseInt(ev.player.id.replace("pid", ""));
		if (parseInt(ev.player.id.replace("pid", "")) > 4) return;
		var playerId = ev.player.id; // 押したプレイヤーのID
		let x, y;
		let playeriImg = "b_06";
		let ballImg = "c_05";
		if (idNum === 2) {
			playeriImg = "b_05";
			ballImg = "c_06";

		}
		if (idNum === 3) {
			playeriImg = "b_04";
			ballImg = "c_07";

		}
		if (idNum === 4) {
			playeriImg = "b_03";
			ballImg = "c_08";

		}
		// （コピペ）
		x = ev.point.x; // 押された位置のX座標
		y = ev.point.y; // 押された位置のX座標
		if (ev.point.x < 60) x = 60;
		if (ev.point.x > g.game.width - 60) x = g.game.width - 60;
		if (ev.point.y < 60) y = 60;
		if (ev.point.y > g.game.height - 60) x = g.game.height - 60;
		if (characters[playerId] == null) {
			// （コピペ）プレイヤー playerId にとって初めての操作の場合: キャラクタデータを生成
			let chara = {
				targetX: x,
				targetY: y,
				x: x,
				y: y,
				dead: false,
				entity: new g.Sprite({
					scene: scene,
					src: scene.asset.getImageById(playeriImg),
					x: x,
					y: y,
					width: 32,
					height: 32
				})
			};
			characters[playerId] = chara;
			// （コピペ）キャラクタのフレームごとの処理(目標座標 (targetX, targetY) に近づくように位置を更新)を登録
			chara.entity.onUpdate.add(function () {
				if (chara.dead === false) {
					let diffX = chara.targetX - chara.entity.x;
					let diffY = chara.targetY - chara.entity.y;
					// （コピペ）既に目標座標にいるなら何もせず抜ける
					if (diffX === 0 && diffY === 0) {
						return;
					}

					//（コピペ） 目標座標から各軸10px以上離れていたら、1割ずつ接近。10px以下なら目標座標に移動
					chara.entity.x += Math.abs(diffX) > 10 ? Math.floor(diffX / 10) : diffX;
					chara.entity.y += Math.abs(diffY) > 10 ? Math.floor(diffY / 10) : diffY;
					chara.entity.modified(); // 変更を反映
				}
			});
			scene.append(chara.entity); // シーンに生成したキャラクタ画像を追加
		} else if (characters[playerId].dead === false) {
			// （コピペ）プレイヤー playerId のキャラが既にいる場合: キャラの目標座標を、クリックされた位置に更新
			let diffX = x - characters[playerId].entity.x;
			let diffY = y - characters[playerId].entity.y;
			if (Math.abs(diffX) <= 10 && Math.abs(diffY) <= 10) makeBall(scene, characters[playerId].targetX, characters[playerId].targetY, g.game.random.generate() * 360, ballImg);
			characters[playerId].targetX = x;
			characters[playerId].targetY = y;
			deadJudge(playerId);
		}

		deadText(scene, playerId, characters[playerId].targetX, characters[playerId].targetY);
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
	let speed = 10;
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
function deadJudge(playerId) {
	const chara = characters[playerId];
	const entity = chara.entity;
	balls.forEach(function (b) {
		if (g.Collision.intersectAreas(entity, b)) {
			entity.destroy();
			characters[playerId].dead = true;
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
