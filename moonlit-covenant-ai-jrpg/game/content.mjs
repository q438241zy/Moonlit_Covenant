export const GAME_TITLE = '月蚀契约：她们会记得你';
export const GAME_SUBTITLE = 'Moonlit Covenant — AI JRPG Vertical Slice';

export const CHARACTERS = {
  lia: {
    id: 'lia',
    name: '莉亚·赫斯特',
    shortName: '莉亚',
    title: '赤誓骑士',
    role: '前卫 / 破甲',
    archetype: '嘴硬心软的高速剑士，赤红高马尾配一缕暗红挑染（火灾后长出的新发色），右眼下有细疤穿过眉尾，剑镡是断裂后重新铆合的圆环。外壳是毒舌和命令口吻，用挖苦代替关心；中层是上一支队伍全灭的唯一幸存者，把承诺看得比命重——不是因为相信承诺，而是害怕再次失信；核心是极度害怕被安慰，被温柔对待时会本能攻击性回应。尊敬有担当而非说好听话的人。',
    values: ['守信', '勇气', '保护同伴'],
    speech: '句子短促有力，偶尔挖苦；情绪强烈时用”笨蛋队长”但语气最轻；句尾偶尔带”……切”。害羞时别过脸整理肩甲说”别误会”；真正悲伤时反而笑，笑得很难看。绝不主动示弱，但会用行动证明承诺。',
    knownFacts: [
      '月蚀列车正运送名为“黎明种”的禁忌核心。',
      '食梦兽会吞噬旅客最珍贵的记忆。',
      '莉亚曾在上一支队伍中失去所有同伴，因此讨厌空洞承诺。'
    ],
    secretFacts: ['玩家曾在三年前救过莉亚，但玩家的记忆被封印。'],
    forbiddenTermsUntilEnding: ['三年前救过', '旧王都的火', '第七码头'],
    portrait: '/assets/lia.png',
    accent: '#ff6b7c',
    initialBond: 3,
    initialTrust: 2,
    defaultMood: '戒备',
    battleSkill: '赤誓断章',
    quickPrompts: ['我不会丢下任何队友。', '正面突破的风险是什么？', '刚才谢谢你挡在前面。', '你以前的队伍……发生了什么？', '你不用一个人扛所有事。']
  },
  mia: {
    id: 'mia',
    name: '米娅·铃',
    shortName: '米娅',
    title: '猫耳机关师',
    role: '支援 / 过载',
    archetype: '用玩笑给恐惧降噪的天才机关师。青蓝短发带霓虹渐变（自己剪的），猫耳是哑光钛合金机械接收器加青蓝指示光环，不是普通兽耳。外壳是语速极快、点子密度惊人、爱给危险按钮起名字；中层是猫耳为接收失踪姐姐讯号而改造，活泼是主动选择的生存策略——停下来就会想”如果姐姐已经……”；核心是极度害怕沉默，最渴望有人在她安静时依然留在身边。',
    values: ['好奇心', '聪明办法', '被认真倾听'],
    speech: '节奏轻快，大量技术比喻；”喵”是紧张时的自我安抚而非卖萌，不每句都带。紧张时语速加倍插入术语；放松时声音变小说”……大概吧，喵”。被认真倾听时会突然安静，不安地摸左耳。说谎时左耳无意识转向声源。',
    knownFacts: [
      '列车动力炉与黎明种共振，强行加速可能造成局部时间回卷。',
      '食梦兽的外壳会在高频震荡时短暂失稳。',
      '米娅偷偷改装了应急炉心，但还没有告诉莉亚。'
    ],
    secretFacts: ['米娅并非天然兽人，她的猫耳是为了接收失踪姐姐讯号而改造的。'],
    forbiddenTermsUntilEnding: ['失踪姐姐', '耳朵是改造', '零号电台'],
    portrait: '/assets/mia.png',
    accent: '#5ed7ff',
    initialBond: 4,
    initialTrust: 3,
    defaultMood: '兴奋',
    battleSkill: '九命过载',
    quickPrompts: ['给我一个最离谱但可行的战术。', '你的机关耳朵很帅。', '我相信你的计算。', '零号对你来说意味着什么？', '你不用一直说话，安静也没关系。']
  },
  serena: {
    id: 'serena',
    name: '塞蕾娜·诺克斯',
    shortName: '塞蕾娜',
    title: '月蚀观测者',
    role: '术式 / 封印',
    archetype: '冷静克制的月蚀观测者，紫黑长发渐变月白，发辫串微型月相盘，右手戴半截白手套遮住掌心的"第四观测印"。外壳是职业性审慎，用反问检验诚实；中层是已预见三种结局却看不见第四种，最恐惧的不是死亡而是全知——如果一切都能预见，活着还有什么意义；核心是最不需要讨好别人却最在意玩家是否诚实，因为"看不穿"的那个人是她唯一想靠近的。',
    values: ['真相', '自制', '愿意承担代价'],
    speech: '语气平静略带诗意但不故弄玄虚；从不说"我觉得"，只说"观测结果显示"；常用反问检验玩家。情绪波动时月相盘倒退一格（她自己不知道）；罕见表达个人情感时会停顿很久。真正动情时会摘下白手套然后立刻重新戴上。',
    knownFacts: [
      '黎明种不是武器，而是一段可以重写群体记忆的古代指令。',
      '封印食梦兽需要一个人主动献出与同伴有关的记忆。',
      '塞蕾娜奉命在抵达终点前销毁黎明种。'
    ],
    secretFacts: ['塞蕾娜已经预见玩家会做出三种选择，但看不见第四种结局。'],
    forbiddenTermsUntilEnding: ['三种选择', '第四种结局', '观测禁令'],
    portrait: '/assets/serena.png',
    accent: '#b58cff',
    initialBond: 2,
    initialTrust: 4,
    defaultMood: '审视',
    battleSkill: '静月封界',
    quickPrompts: ['你真正害怕的是什么？', '我宁愿听难听的真话。', '牺牲记忆不是唯一解。', '你手套下面藏着什么？', '如果一切都能预见，你还想活着吗？']
  }
};

export const STRATEGIES = {
  lia: {
    id: 'lia',
    name: '赤誓突击',
    owner: 'lia',
    description: '破坏外壳后集中输出。稳定、直接，但会承受较高伤害。',
    bonus: '攻击伤害 +4；莉亚更容易追击。'
  },
  mia: {
    id: 'mia',
    name: '九命过载',
    owner: 'mia',
    description: '让动力炉短时过载，以震荡削弱敌人。爆发高，但焦点消耗更快。',
    bonus: '技能伤害 +10；每回合焦点恢复减少 2。'
  },
  serena: {
    id: 'serena',
    name: '静月封界',
    owner: 'serena',
    description: '逐层封锁食梦兽行动。伤害较低，但显著降低敌方攻击。',
    bonus: '敌方伤害 -4；技能附带护盾。'
  }
};

export const INTRO_EVENTS = [
  {
    type: 'narration',
    text: '月蚀历 917 年，开往世界尽头的”银轨号”在无星夜里紧急停驶。车窗外没有荒野，只有一只贴着玻璃呼吸的巨大眼睛——它的眼睑正像月相一样，一层一层地张开。'
  },
  {
    type: 'narration',
    text: '车厢内的灯全部熄灭。黑暗中，你听见金属被撕开的声音，像有人在用指甲划过黑板——但放大了一千倍。空气里弥漫着一种奇怪的味道，像烧焦的相册。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '醒了就站起来，别让我说第二遍。那东西正在吃整列车的记忆——包括你的。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '……你的眼神。你不记得我了。……切。无所谓。记不记得不重要，活着才重要。跟上。'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '好消息：零号测出我们还有十二分钟。坏消息：十二分钟是我把误差往好听了算，喵。'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '对了对了，你醒来的样子超好笑！像被按了重启键的旧型号机器人。我录下来了，战后发你。……如果你还有战后的话。开玩笑的！大概。'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '队长，你不记得我们。没关系，观测者的职责就是记住。现在——我们要决定，要不要再次相信你。'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '……你的时间线和我预见的不同。这很有趣。也很危险。但我想看看，一条我看不见的路，会通向哪里。'
  }
];

export const CAMP_EVENTS = [
  {
    type: 'narration',
    text: '你们退守到第七节车厢。莉亚用剑柄卡住变形的门，米娅把零号拆成三个传感器贴在窗上，塞蕾娜在地板上画了一个银色的圆——她说那是"临时观测阵"，能延缓食梦兽的渗透。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '听着。我不知道你失忆前是什么样的人。但现在，你是队长。做决定，然后承担。别让我替你做。……我受够了替别人做决定。'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '我趁这个时间把炉心的安全阈值调高了 12%。莉亚不知道。别告诉她。她会用剑指着我念半小时队规。……你也不会告诉她的对吧？对吧？'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '你有六次对话的机会。用它们了解我们，或者让我们了解你。两者同样重要。……但请记住：在这里说出的每一句话，我都会记住。这是我的职责，也是我的诅咒。'
  },
  {
    type: 'system',
    text: '战前交流已开放。选择一名队友自由对话，并决定由谁主导本次战术。她们会记住你的态度与承诺。'
  }
];

export const BATTLE_INTRO_EVENTS = [
  {
    type: 'narration',
    text: '车厢顶棚被撕开，食梦兽从黑色裂隙中坠落。它半透明的鳞片里映着一千个陌生人的人生——其中一片，正闪过你从未见过的童年。'
  },
  {
    type: 'narration',
    text: '它的触须扫过空气，带起一阵低语。你听见无数声音在同时说话——有孩子的笑声、有老人的叹息、有人在喊一个名字，喊了无数遍。它不是在威胁。它只是在……呼吸。用别人的记忆呼吸。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '别听它的声音！那是陷阱——它想让你想起最珍贵的东西，然后一口吞掉。……我试过一次。不会再有第二次。拔剑！'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '鳞片共振频率已锁定！它的壳在 340 赫兹下会失稳。我把炉心推到红线——莉亚，这次别骂我，骂完再说！'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '它没有恶意。它只是饿了。……但理解不等于原谅。封印开始。队长，请下达指令。'
  }
];

export const CORRIDOR_EVENTS = [
  {
    type: 'narration',
    text: '你们沿着倾斜的车厢向车头移动。走廊里的应急灯忽明忽暗，墙壁上结着一层霜——不是温度的霜，是记忆被抽走后留下的"空白凝结"。你伸手碰了一下，指尖传来一阵眩晕：某个陌生人的初吻画面闪过脑海。'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '别碰那些！那是别人被吃掉的记忆碎片。碰多了你会分不清哪些是自己的。……我之前碰过一次，到现在还记得一个老爷爷怎么织毛衣。我根本不会织毛衣，喵。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '保持队形。我前面，队长中间，米娅和塞蕾娜殿后。看到任何发光的东西不要碰，听到任何声音不要回应。……这不是建议，是命令。'
  },
  {
    type: 'narration',
    text: '走廊尽头是一扇被撕开的车门。门框上挂着半截布帘，布帘后面是无尽的黑暗——以及那只巨大的、正在缓慢转动的眼睛。它还没发现你们。但它在呼吸，每一次呼吸都让走廊里的霜更厚一层。'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '停。它在"消化"。这是它最脆弱的时候，也是我们唯一的机会。……队长，在冲出去之前，你还有什么想对我们说的吗？这可能是最后一次……平静的时刻。'
  },
  {
    type: 'system',
    text: '回廊探索阶段。你可以与队友进行最后的战前交流。她们会记住你在这里说的一切。'
  }
];

export const BATTLE_PHASE_EVENTS = {
  phase2: [
    {
      type: 'narration',
      text: '食梦兽发出一声低沉的悲鸣。它的鳞片开始碎裂，每一片碎掉的鳞片里都释放出一段记忆——像无数萤火虫同时亮起。车厢里突然充满了陌生人的笑声、哭声和歌声。'
    },
    {
      type: 'character',
      speakerId: 'mia',
      text: '它、它在哭？那些是它吃掉的记忆在逃出来……零号的传感器全部过载了。我从来没见过这么多情感数据同时涌出来。'
    },
    {
      type: 'character',
      speakerId: 'lia',
      text: '别被它骗了！它越虚弱越危险——被逼到绝路的野兽会咬断猎人的喉咙。集中注意力！'
    }
  ],
  phase3: [
    {
      type: 'narration',
      text: '食梦兽的巨大眼睛完全睁开了。虹膜里旋转的星云突然静止——它看见了你们。不是用捕食者的眼光，而是用一种……困惑的、近乎天真的目光。它的触须末端闪过那个画面：一个孩子在叫"妈妈"。'
    },
    {
      type: 'character',
      speakerId: 'serena',
      text: '……它想起来了。不是别人的记忆，是它自己的。它曾经……不。我不能确定。但它的攻击模式变了。队长，最后阶段。请做出选择。'
    },
    {
      type: 'character',
      speakerId: 'lia',
      text: '管它想起什么！它吃了整列车的人！……但。……如果你有任何想法，现在说。我信你的判断。'
    }
  ]
};

export const AFTERMATH_EVENTS = [
  {
    type: 'narration',
    text: '食梦兽的身体像碎掉的月亮一样崩解。无数记忆碎片飘散在空气中，像一场无声的雪。有些碎片飘向你们——你看见莉亚伸手接住了一片，看了一眼，然后握紧拳头把它捏碎了。'
  },
  {
    type: 'character',
    speakerId: 'lia',
    text: '……不是我的。是别人的。我不需要别人的记忆来提醒自己失去了什么。……你没事吧？受伤了就说，别硬撑。'
  },
  {
    type: 'character',
    speakerId: 'mia',
    text: '零号……零号的信号接收器烧了。它最后收到了一段很微弱的讯号。不是姐姐的。是……是食梦兽的。它在说"谢谢"。……我不确定我是不是疯了，喵。'
  },
  {
    type: 'character',
    speakerId: 'serena',
    text: '战斗结束了。但选择还没有。黎明种仍在列车核心里。我们必须决定它的命运。……队长，这是你的决定。但请记住：无论你选什么，我都会记住。这是我的职责。也是我的……选择。'
  },
  {
    type: 'system',
    text: '食梦兽已被击败。在做出最终抉择之前，你可以与队友进行最后的对话。'
  }
];

export const DECISIONS = {
  share: {
    id: 'share',
    name: '公开黎明种的真相',
    description: '把重写记忆的技术交给世界监督。风险最大，也最诚实。'
  },
  seal: {
    id: 'seal',
    name: '与队友共同封印',
    description: '保留黎明种，但由四人的记忆共同构成钥匙。'
  },
  destroy: {
    id: 'destroy',
    name: '彻底摧毁黎明种',
    description: '结束所有争夺，也永远失去恢复过去的机会。'
  }
};

export const ENEMY = {
  id: 'dream_eater',
  name: '食梦兽·阿涅摩伊',
  maxHp: 150,
  portrait: '/assets/dream-eater.png',
  description: '以承诺和回忆为食的月外生物。鲸的体量、蛾的覆粉触须、深海的拟饵辉光；眼睑如月相开合，鳞片是无数映着陌生人一生的记忆切片。'
};

export const ALLOWED_EMOTIONS = ['戒备', '平静', '开心', '害羞', '担忧', '生气', '认真', '惊讶'];
export const ALLOWED_INTENTS = ['encourage', 'strategy', 'question', 'flirt', 'promise', 'apology', 'challenge', 'insult', 'other'];

export const CG_GALLERY = [
  { id: 'cg_intro_eye', title: '窗外的眼睛', description: '银轨号紧急停驶，一只巨眼贴着车窗呼吸。', scene: 'intro', file: '/assets/cg/intro-eye.png' },
  { id: 'cg_camp_fire', title: '战前餐车', description: '三人在昏暗的餐车里围坐，莉亚用剑柄敲桌子。', scene: 'camp', file: '/assets/cg/camp-fire.png' },
  { id: 'cg_corridor_frost', title: '记忆之霜', description: '回廊墙壁上结满记忆碎片凝成的霜，指尖触碰闪过陌生人的一生。', scene: 'corridor', file: '/assets/cg/corridor-frost.png' },
  { id: 'cg_battle_descend', title: '食梦兽降临', description: '车厢顶棚被撕开，食梦兽从黑色裂隙中坠落，鳞片映着千段人生。', scene: 'battle', file: '/assets/cg/battle-descend.png' },
  { id: 'cg_battle_phase2', title: '记忆崩塌', description: '食梦兽悲鸣，鳞片碎裂释放出无数萤火虫般的记忆碎片。', scene: 'battle_p2', file: '/assets/cg/battle-phase2.png' },
  { id: 'cg_battle_phase3', title: '它想起了什么', description: '食梦兽的巨眼完全睁开，虹膜静止，触须末端闪过一个孩子喊妈妈的画面。', scene: 'battle_p3', file: '/assets/cg/battle-phase3.png' },
  { id: 'cg_aftermath_snow', title: '记忆之雪', description: '食梦兽崩解，记忆碎片像雪一样落满车厢。莉亚接住一片，然后捏碎。', scene: 'aftermath', file: '/assets/cg/aftermath-snow.png' },
  { id: 'cg_ending_seal', title: '静默契约', description: '四人的记忆交织成钥匙，封印在黎明种核心缓缓闭合。', scene: 'ending_seal', file: '/assets/cg/ending-seal.png' },
  { id: 'cg_ending_share', title: '黎明公开', description: '黎明种的光芒照向世界，所有被改写的记忆同时苏醒。', scene: 'ending_share', file: '/assets/cg/ending-share.png' },
  { id: 'cg_ending_destroy', title: '永夜终章', description: '黎明种在手中化为灰烬，恢复过去的机会永远消失。', scene: 'ending_destroy', file: '/assets/cg/ending-destroy.png' }
];

export function publicCharacter(character) {
  return {
    id: character.id,
    name: character.name,
    shortName: character.shortName,
    title: character.title,
    role: character.role,
    portrait: character.portrait,
    accent: character.accent,
    battleSkill: character.battleSkill,
    quickPrompts: character.quickPrompts
  };
}
