const mockData = [
	// --- 剧本1：多标签用户，参与多个环 ---
	{
		userId: 'U001',
		userName: '摄影社小李',
		offerTags: [
			{
				tag: '单反相机',
				attributes: {
					brand: '佳能',
					model: '5D Mark IV',
					condition: 0.8,
					price: 15000,
					description: '专业级单反相机'
				}
			},
			{
				tag: '镜头',
				attributes: {
					brand: '佳能',
					model: '24-70mm',
					condition: 0.9,
					price: 8000,
					description: '专业镜头'
				}
			}
		],
		wantTags: [
			{
				tag: '吉他',
				attributes: {
					brand: '雅马哈',
					model: 'FG800',
					level: 0.7,
					recognition: 0.8,
					description: '民谣吉他'
				}
			},
			{
				tag: '滑板',
				attributes: {
					brand: 'Element',
					model: 'Section',
					condition: 0.7,
					price: 800,
					description: '专业滑板'
				}
			}
		]
	},
	{
		userId: 'U002',
		userName: '文艺部小王',
		offerTags: [
			{
				tag: '吉他',
				attributes: {
					brand: '雅马哈',
					model: 'FG800',
					level: 0.7,
					recognition: 0.8,
					description: '民谣吉他'
				}
			}
		],
		wantTags: [
			{
				tag: '滑板',
				attributes: {
					brand: 'Element',
					model: 'Section',
					condition: 0.7,
					price: 800,
					description: '专业滑板'
				}
			}
		]
	},
	{
		userId: 'U003',
		userName: '滑板社大飞',
		offerTags: [
			{
				tag: '滑板',
				attributes: {
					brand: 'Element',
					model: 'Section',
					condition: 0.7,
					price: 800,
					description: '专业滑板'
				}
			}
		],
		wantTags: [
			{
				tag: '单反相机',
				attributes: {
					brand: '佳能',
					model: '5D Mark IV',
					condition: 0.8,
					price: 15000,
					description: '专业级单反相机'
				}
			}
		]
	},

	// --- 剧本2：稀缺物品场景 ---
	{
		userId: 'U004',
		userName: '英语系学霸',
		offerTags: [
			{
				tag: '四六级辅导',
				attributes: {
					level: 0.9,
					recognition: 0.85,
					experience: 3,
					certification: 'CET-6',
					description: '英语四六级辅导'
				}
			}
		],
		wantTags: [
			{
				tag: '电脑维修',
				attributes: {
					brand: '不限',
					model: '笔记本',
					condition: 0.6,
					price: 5000,
					description: '电脑维修服务'
				}
			}
		]
	},
	{
		userId: 'U005',
		userName: '计科修机王',
		offerTags: [
			{
				tag: '电脑维修',
				attributes: {
					brand: '不限',
					model: '笔记本',
					condition: 0.6,
					price: 5000,
					description: '电脑维修服务'
				}
			}
		],
		wantTags: [
			{
				tag: '四六级辅导',
				attributes: {
					level: 0.9,
					recognition: 0.85,
					experience: 3,
					certification: 'CET-6',
					description: '英语四六级辅导'
				}
			}
		]
	},
	{
		userId: 'U006',
		userName: '考研党小张',
		offerTags: [
			{
				tag: '电脑维修',
				attributes: {
					brand: '不限',
					model: '笔记本',
					condition: 0.7,
					price: 4000,
					description: '电脑维修服务'
				}
			}
		],
		wantTags: [
			{
				tag: '四六级辅导',
				attributes: {
					level: 0.85,
					recognition: 0.8,
					experience: 2,
					certification: 'CET-6',
					description: '英语四六级辅导'
				}
			}
		]
	},

	// --- 剧本3：热门需求场景 ---
	{
		userId: 'U007',
		userName: '吉他社阿强',
		offerTags: [
			{
				tag: '吉他教程',
				attributes: {
					brand: 'Fender',
					model: 'Stratocaster',
					level: 0.8,
					recognition: 0.75,
					description: '吉他教学'
				}
			}
		],
		wantTags: [
			{
				tag: '篮球',
				attributes: {
					brand: 'Nike',
					model: 'LeBron',
					condition: 0.7,
					price: 1200,
					description: '篮球鞋'
				}
			}
		]
	},
	{
		userId: 'U008',
		userName: '篮球队大伟',
		offerTags: [
			{
				tag: '篮球',
				attributes: {
					brand: 'Nike',
					model: 'LeBron',
					condition: 0.7,
					price: 1200,
					description: '篮球鞋'
				}
			}
		],
		wantTags: [
			{
				tag: '吉他教程',
				attributes: {
					brand: 'Fender',
					model: 'Stratocaster',
					level: 0.8,
					recognition: 0.75,
					description: '吉他教学'
				}
			}
		]
	},
	{
		userId: 'U009',
		userName: '篮球社小明',
		offerTags: [
			{
				tag: '篮球',
				attributes: {
					brand: 'Adidas',
					model: 'Curry',
					condition: 0.8,
					price: 1000,
					description: '篮球鞋'
				}
			}
		],
		wantTags: [
			{
				tag: '吉他教程',
				attributes: {
					brand: 'Fender',
					model: 'Stratocaster',
					level: 0.75,
					recognition: 0.7,
					description: '吉他教学'
				}
			}
		]
	}
];

function calculateSupplyDemand(data) {
	const supply = new Map();
	const demand = new Map();

	for (const user of data) {
		for (const offer of user.offerTags) {
			const tag = offer.tag;
			supply.set(tag, (supply.get(tag) || 0) + 1);
		}

		for (const want of user.wantTags) {
			const tag = want.tag;
			demand.set(tag, (demand.get(tag) || 0) + 1);
		}
	}

	const scarcity = new Map();
	const allTags = new Set([...supply.keys(), ...demand.keys()]);

	for (const tag of allTags) {
		const supplyCount = supply.get(tag) || 0;
		const demandCount = demand.get(tag) || 0;
		const scarcityScore = supplyCount > 0 ? demandCount / supplyCount : Infinity;
		scarcity.set(tag, {
			supply: supplyCount,
			demand: demandCount,
			scarcity: scarcityScore
		});
	}

	return {
		supply: Object.fromEntries(supply),
		demand: Object.fromEntries(demand),
		scarcity: Object.fromEntries(scarcity)
	};
}

function calculateAttributeSimilarity(offerAttr, wantAttr, offerType, wantType) {
	let similarity = 0;
	let weightSum = 0;

	if (offerType === wantType) {
		if (offerType === 'skill') {
			if (offerAttr.level !== undefined && wantAttr.level !== undefined) {
				const levelDiff = Math.abs(offerAttr.level - wantAttr.level);
				similarity += (1 - levelDiff) * 0.4;
				weightSum += 0.4;
			}
			if (offerAttr.recognition !== undefined && wantAttr.recognition !== undefined) {
				const recognitionDiff = Math.abs(offerAttr.recognition - wantAttr.recognition);
				similarity += (1 - recognitionDiff) * 0.3;
				weightSum += 0.3;
			}
			if (offerAttr.experience !== undefined && wantAttr.experience !== undefined) {
				const expDiff = Math.abs(offerAttr.experience - wantAttr.experience) / 5;
				similarity += (1 - Math.min(expDiff, 1)) * 0.2;
				weightSum += 0.2;
			}
			if (offerAttr.certification !== undefined && wantAttr.certification !== undefined) {
				const certMatch = offerAttr.certification === wantAttr.certification ? 1 : 0.5;
				similarity += certMatch * 0.1;
				weightSum += 0.1;
			}
		} else {
			if (offerAttr.brand !== undefined && wantAttr.brand !== undefined) {
				const brandMatch = offerAttr.brand === wantAttr.brand ? 1 : 0.3;
				similarity += brandMatch * 0.3;
				weightSum += 0.3;
			}
			if (offerAttr.model !== undefined && wantAttr.model !== undefined) {
				const modelMatch = offerAttr.model === wantAttr.model ? 1 : 0.5;
				similarity += modelMatch * 0.2;
				weightSum += 0.2;
			}
			if (offerAttr.condition !== undefined && wantAttr.condition !== undefined) {
				const conditionDiff = Math.abs(offerAttr.condition - wantAttr.condition);
				similarity += (1 - conditionDiff) * 0.3;
				weightSum += 0.3;
			}
			if (offerAttr.price !== undefined && wantAttr.price !== undefined) {
				const priceRatio = Math.min(offerAttr.price / wantAttr.price, wantAttr.price / offerAttr.price);
				similarity += priceRatio * 0.2;
				weightSum += 0.2;
			}
		}
	} else {
		if (offerAttr.description !== undefined && wantAttr.description !== undefined) {
			const descSim = calculateTextSimilarity(offerAttr.description, wantAttr.description);
			similarity += descSim * 0.5;
			weightSum += 0.5;
		}
		if (offerAttr.price !== undefined && wantAttr.price !== undefined) {
			const priceRatio = Math.min(offerAttr.price / wantAttr.price, wantAttr.price / offerAttr.price);
			similarity += priceRatio * 0.3;
			weightSum += 0.3;
		}
		if (offerAttr.condition !== undefined && wantAttr.condition !== undefined) {
			const conditionDiff = Math.abs(offerAttr.condition - wantAttr.condition);
			similarity += (1 - conditionDiff) * 0.2;
			weightSum += 0.2;
		}
	}

	return weightSum > 0 ? similarity / weightSum : 0.3;
}

function calculateTextSimilarity(text1, text2) {
	const words1 = text1.toLowerCase().split('');
	const words2 = text2.toLowerCase().split('');
	
	let matchCount = 0;
	const maxLength = Math.max(words1.length, words2.length);
	
	for (let i = 0; i < maxLength; i++) {
		if (words1[i] === words2[i]) {
			matchCount++;
		}
	}
	
	return matchCount / maxLength;
}

function getItemType(tag, attributes) {
	if (attributes.level !== undefined || attributes.recognition !== undefined) {
		return 'skill';
	}
	if (attributes.brand !== undefined || attributes.model !== undefined) {
		return 'item';
	}
	return 'item';
}

function findMatchCycles(data, threshold = 0.5) {
	const startTime = performance.now();
	const supplyDemand = calculateSupplyDemand(data);
	const graph = new Map();

	for (const user of data) {
		if (!graph.has(user.userId)) {
			graph.set(user.userId, []);
		}

		for (const offer of user.offerTags) {
			const offerType = getItemType(offer.tag, offer.attributes);

			for (const target of data) {
				if (target.userId === user.userId) continue;

				for (const want of target.wantTags) {
					if (offer.tag !== want.tag) continue;

					const wantType = getItemType(want.tag, want.attributes);
					let similarity = calculateAttributeSimilarity(
						offer.attributes,
						want.attributes,
						offerType,
						wantType
					);

					if (similarity > 0) {
						const tagScarcity = supplyDemand.scarcity[offer.tag]?.scarcity || 1;
						const scarcityWeight = Math.min(tagScarcity, 3);
						similarity = similarity * (1 + (scarcityWeight - 1) * 0.2);
						similarity = Math.min(similarity, 1);

						graph.get(user.userId).push({
							userId: target.userId,
							offerTag: offer.tag,
							wantTag: want.tag,
							probability: similarity,
							scarcityWeight: scarcityWeight
						});
					}
				}
			}
		}
	}

	let totalEdges = 0;
	let totalProbability = 0;
	for (const [userId, neighbors] of graph.entries()) {
		totalEdges += neighbors.length;
		for (const neighbor of neighbors) {
			totalProbability += neighbor.probability;
		}
	}

	const cycles = [];
	const cycleKeys = new Set();

	for (const [userId, neighbors] of graph.entries()) {
		for (const neighbor of neighbors) {
			if (!graph.has(neighbor.userId)) continue;

			const reverseEdges = graph.get(neighbor.userId).filter(
				n => n.userId === userId && n.offerTag === neighbor.wantTag && n.wantTag === neighbor.offerTag
			);

			if (reverseEdges.length > 0) {
				const forwardProb = neighbor.probability;
				const reverseProb = reverseEdges[0].probability;
				const avgProbability = (forwardProb + reverseProb) / 2;

				if (avgProbability >= threshold) {
					const sortedIds = [userId, neighbor.userId].sort();
					const cycleKey = `pair:${sortedIds.join('-')}:${neighbor.offerTag}:${neighbor.wantTag}`;

					if (!cycleKeys.has(cycleKey)) {
						cycleKeys.add(cycleKey);

						const userA = data.find(u => u.userId === userId);
						const userB = data.find(u => u.userId === neighbor.userId);

						cycles.push({
							type: 'pair',
							path: [userId, neighbor.userId],
							tags: [neighbor.offerTag, neighbor.wantTag],
							probability: avgProbability,
							scarcityWeight: (neighbor.scarcityWeight + reverseEdges[0].scarcityWeight) / 2,
							details: [
								{
									userId: userA.userId,
									userName: userA.userName,
									offerTag: neighbor.offerTag,
									wantTag: neighbor.wantTag,
									offerAttributes: userA.offerTags.find(o => o.tag === neighbor.offerTag)?.attributes,
									wantAttributes: userA.wantTags.find(w => w.tag === neighbor.wantTag)?.attributes
								},
								{
									userId: userB.userId,
									userName: userB.userName,
									offerTag: neighbor.wantTag,
									wantTag: neighbor.offerTag,
									offerAttributes: userB.offerTags.find(o => o.tag === neighbor.wantTag)?.attributes,
									wantAttributes: userB.wantTags.find(w => w.tag === neighbor.offerTag)?.attributes
								}
							]
						});
					}
				}
			}
		}
	}

	for (const [userId, neighbors] of graph.entries()) {
		for (const neighbor of neighbors) {
			if (!graph.has(neighbor.userId)) continue;

			for (const secondNeighbor of graph.get(neighbor.userId)) {
				if (!graph.has(secondNeighbor.userId)) continue;

				const closingEdges = graph.get(secondNeighbor.userId).filter(
					n => n.userId === userId && 
					     n.offerTag === secondNeighbor.wantTag && 
					     n.wantTag === neighbor.offerTag
				);

				if (closingEdges.length > 0) {
					if (userId !== secondNeighbor.userId && 
					    neighbor.userId !== secondNeighbor.userId &&
					    neighbor.offerTag !== secondNeighbor.offerTag) {
						
						const prob1 = neighbor.probability;
						const prob2 = secondNeighbor.probability;
						const prob3 = closingEdges[0].probability;
						const avgProbability = (prob1 + prob2 + prob3) / 3;

						if (avgProbability >= threshold) {
							const sortedIds = [userId, neighbor.userId, secondNeighbor.userId].sort();
							const cycleKey = `triangle:${sortedIds.join('-')}:${neighbor.offerTag}:${secondNeighbor.offerTag}:${closingEdges[0].offerTag}`;

							if (!cycleKeys.has(cycleKey)) {
								cycleKeys.add(cycleKey);

								const userA = data.find(u => u.userId === userId);
								const userB = data.find(u => u.userId === neighbor.userId);
								const userC = data.find(u => u.userId === secondNeighbor.userId);

								cycles.push({
									type: 'triangle',
									path: [userId, neighbor.userId, secondNeighbor.userId],
									tags: [neighbor.offerTag, secondNeighbor.offerTag, closingEdges[0].offerTag],
									probability: avgProbability,
									scarcityWeight: (neighbor.scarcityWeight + secondNeighbor.scarcityWeight + closingEdges[0].scarcityWeight) / 3,
									details: [
										{
											userId: userA.userId,
											userName: userA.userName,
											offerTag: neighbor.offerTag,
											wantTag: secondNeighbor.offerTag,
											offerAttributes: userA.offerTags.find(o => o.tag === neighbor.offerTag)?.attributes,
											wantAttributes: userA.wantTags.find(w => w.tag === secondNeighbor.offerTag)?.attributes
										},
										{
											userId: userB.userId,
											userName: userB.userName,
											offerTag: secondNeighbor.offerTag,
											wantTag: closingEdges[0].offerTag,
											offerAttributes: userB.offerTags.find(o => o.tag === secondNeighbor.offerTag)?.attributes,
											wantAttributes: userB.wantTags.find(w => w.tag === closingEdges[0].offerTag)?.attributes
										},
										{
											userId: userC.userId,
											userName: userC.userName,
											offerTag: closingEdges[0].offerTag,
											wantTag: neighbor.offerTag,
											offerAttributes: userC.offerTags.find(o => o.tag === closingEdges[0].offerTag)?.attributes,
											wantAttributes: userC.wantTags.find(w => w.tag === neighbor.offerTag)?.attributes
										}
									]
								});
							}
						}
					}
				}
			}
		}
	}

	const endTime = performance.now();
	const executionTime = endTime - startTime;

	const avgProbability = totalEdges > 0 ? totalProbability / totalEdges : 0;
	const userCycleCount = new Map();
	const userCycleDetails = new Map();
	
	for (const cycle of cycles) {
		for (const userId of cycle.path) {
			userCycleCount.set(userId, (userCycleCount.get(userId) || 0) + 1);
			
			if (!userCycleDetails.has(userId)) {
				userCycleDetails.set(userId, []);
			}
			userCycleDetails.get(userId).push({
				cycleId: cycles.indexOf(cycle),
				type: cycle.type,
				probability: cycle.probability,
				tags: cycle.tags,
				scarcityWeight: cycle.scarcityWeight
			});
		}
	}

	const maxUserCycleCount = Math.max(...userCycleCount.values(), 0);
	const avgUserCycleCount = userCycleCount.size > 0 
		? Array.from(userCycleCount.values()).reduce((a, b) => a + b, 0) / userCycleCount.size 
		: 0;

	const scarcityScores = Object.values(supplyDemand.scarcity);
	const avgScarcity = scarcityScores.length > 0 
		? scarcityScores.reduce((a, b) => a + b.scarcity, 0) / scarcityScores.length 
		: 0;

	const cycleOverlapAnalysis = analyzeCycleOverlap(cycles, userCycleCount, userCycleDetails);

	cycles.sort((a, b) => {
		const aScore = a.probability * 0.6 + a.scarcityWeight * 0.4;
		const bScore = b.probability * 0.6 + b.scarcityWeight * 0.4;
		return bScore - aScore;
	});

	return {
		cycles: cycles,
		supplyDemand: supplyDemand,
		cycleOverlapAnalysis: cycleOverlapAnalysis,
		performance: {
			executionTime: executionTime,
			dataSize: data.length,
			totalEdges: totalEdges,
			cycleCount: cycles.length,
			pairCount: cycles.filter(c => c.type === 'pair').length,
			triangleCount: cycles.filter(c => c.type === 'triangle').length,
			avgProbability: avgProbability,
			threshold: threshold,
			avgDegree: data.length > 0 ? (totalEdges / data.length).toFixed(2) : 0,
			matchRate: data.length > 0 ? ((cycles.length / data.length) * 100).toFixed(2) : 0,
			maxUserCycleCount: maxUserCycleCount,
			avgUserCycleCount: avgUserCycleCount.toFixed(2),
			avgScarcity: avgScarcity.toFixed(2),
			probabilityDistribution: calculateProbabilityDistribution(cycles),
			userCycleDistribution: Array.from(userCycleCount.entries()).sort((a, b) => b[1] - a[1])
		}
	};
}

function analyzeCycleOverlap(cycles, userCycleCount, userCycleDetails) {
	const analysis = {
		multiCycleUsers: [],
		hotUsers: [],
		cycleOverlapMatrix: new Map(),
		userRoleAnalysis: new Map()
	};

	for (const [userId, cycleCount] of userCycleCount.entries()) {
		if (cycleCount >= 2) {
			const user = mockData.find(u => u.userId === userId);
			const userCycles = userCycleDetails.get(userId);
			
			const roleAnalysis = analyzeUserRole(userId, userCycles);
			analysis.userRoleAnalysis.set(userId, roleAnalysis);

			const multiCycleUser = {
				userId: userId,
				userName: user.userName,
				cycleCount: cycleCount,
				offerTags: user.offerTags.map(t => t.tag),
				wantTags: user.wantTags.map(t => t.tag),
				role: roleAnalysis.primaryRole,
				avgProbability: userCycles.reduce((sum, c) => sum + c.probability, 0) / userCycles.length,
				cycleTypes: userCycles.map(c => c.type),
				participatedTags: [...new Set(userCycles.flatMap(c => c.tags))],
				scarcityScore: userCycles.reduce((sum, c) => sum + c.scarcityWeight, 0) / userCycles.length
			};

			analysis.multiCycleUsers.push(multiCycleUser);

			if (cycleCount >= 3) {
				analysis.hotUsers.push(multiCycleUser);
			}
		}
	}

	analysis.multiCycleUsers.sort((a, b) => b.cycleCount - a.cycleCount);
	analysis.hotUsers.sort((a, b) => b.cycleCount - a.cycleCount);

	for (let i = 0; i < cycles.length; i++) {
		for (let j = i + 1; j < cycles.length; j++) {
			const cycleA = cycles[i];
			const cycleB = cycles[j];
			const overlap = cycleA.path.filter(userId => cycleB.path.includes(userId));
			
			if (overlap.length > 0) {
				const key = `${i}-${j}`;
				analysis.cycleOverlapMatrix.set(key, {
					cycleAIndex: i,
					cycleBIndex: j,
					overlapUsers: overlap,
					overlapCount: overlap.length,
					cycleAType: cycleA.type,
					cycleBType: cycleB.type
				});
			}
		}
	}

	return analysis;
}

function analyzeUserRole(userId, userCycles) {
	const roleCounts = { provider: 0, consumer: 0, bridge: 0 };
	
	for (const cycle of userCycles) {
		const user = mockData.find(u => u.userId === userId);
		const offerTags = user.offerTags.map(t => t.tag);
		const wantTags = user.wantTags.map(t => t.tag);
		
		const isProvider = cycle.tags.some(tag => offerTags.includes(tag));
		const isConsumer = cycle.tags.some(tag => wantTags.includes(tag));
		
		if (isProvider && !isConsumer) {
			roleCounts.provider++;
		} else if (!isProvider && isConsumer) {
			roleCounts.consumer++;
		} else {
			roleCounts.bridge++;
		}
	}

	let primaryRole = 'balanced';
	if (roleCounts.provider > roleCounts.consumer && roleCounts.provider > roleCounts.bridge) {
		primaryRole = 'provider';
	} else if (roleCounts.consumer > roleCounts.provider && roleCounts.consumer > roleCounts.bridge) {
		primaryRole = 'consumer';
	} else if (roleCounts.bridge > roleCounts.provider && roleCounts.bridge > roleCounts.consumer) {
		primaryRole = 'bridge';
	}

	return {
		primaryRole: primaryRole,
		roleCounts: roleCounts,
		totalCycles: userCycles.length
	};
}

function calculateProbabilityDistribution(cycles) {
	if (cycles.length === 0) return { high: 0, medium: 0, low: 0 };

	const distribution = { high: 0, medium: 0, low: 0 };

	for (const cycle of cycles) {
		if (cycle.probability >= 0.7) {
			distribution.high++;
		} else if (cycle.probability >= 0.5) {
			distribution.medium++;
		} else {
			distribution.low++;
		}
	}

	return distribution;
}

// 导出函数
module.exports = {
	findMatchCycles,
	calculateSupplyDemand,
	calculateAttributeSimilarity,
	calculateTextSimilarity
};
module.exports = { findMatchCycles }
