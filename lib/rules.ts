/**
 * 发音修正规则文档
 * 基于 TTS小模型发音修正用户手册
 */

export const pronunciationRules = {
  title: "TTS小模型发音修正用户手册",
  version: "v1.0.0",
  updateDate: "2025年12月11日",
  authors: ["@邱海燕", "@李晨"],
  
  introduction: {
    title: "引言",
    content: "欢迎使用TTS（文字转语音）发音修正功能。该功能主要用于确保TTS在朗读时，能准确读出你期望的发音，尤其是多音字（如\"重量\"和\"重复\"中的\"重\"）、专业名词（如羟(qiǎng)基、甾(zāi)体、朊(ruǎn)病毒）。",
    note: "目前线上通过简单替换文本的方式进行发音修正，虽然在部分场景中有效，但也容易导致其他语境下出现重音、韵律或发音错误。为此，我们制定了本手册，为您提供一套明确的标注语法，直接引导模型生成正确的读音，相当于为TTS系统配备了一个精准的\"发音指南\"。学会使用这一功能，将有助于显著提升课程内容制作、师生互动等场景中的语音合成质量。"
  },

  newSolution: {
    title: "新方案",
    examples: [
      {
        text: "开篇\"明月几时有\"用设问手法，写出中秋夜望月的情境。",
        annotation1: "中(/zhong1/)",
        result1: "开篇\"明月几时有\"用设问手法，写出中(/zhong1/)秋夜望月的情境。",
        annotation2: "中(/zhōng/)",
        result2: "开篇\"明月几时有\"用设问手法，写出中(/zhōng/)秋夜望月的情境。"
      },
      {
        text: "人物传记创作的核心原则中，哪个原则是判断的关键呢？",
        annotation1: "中(/zhong1/)",
        result1: "人物传记创作的核心原则中(/zhong1/)，哪个原则是判断的关键呢？",
        annotation2: "中(/zhōng/)",
        result2: "人物传记创作的核心原则中(/zhōng/)，哪个原则是判断的关键呢？"
      },
      {
        text: "\"二b\"这个答案准确地对应了题目选项，直接选中了诸葛亮写两篇出师表的核心目的。",
        annotation1: "中(/zhong4/)",
        result1: "\"二b\"这个答案准确地对应了题目选项，直接选中(/zhong4/)了诸葛亮写两篇出师表的核心目的。",
        annotation2: "中(/zhòng/)",
        result2: "\"二b\"这个答案准确地对应了题目选项，直接选中(/zhòng/)了诸葛亮写两篇出师表的核心目的。"
      },
      {
        text: "让大家流口水解渴的？",
        annotation1: "解(/**jie3**/)",
        result1: "让大家流口水解(/**jie3**/)渴的？",
        annotation2: "解(/**jiě**/)",
        result2: "让大家流口水解(/**jiě**/)渴的？"
      },
      {
        text: "其实这个速度差异有个专门的名称，叫做速度差。",
        annotation1: "差(/cha1/)",
        result1: "其实这个速度差(/cha1/)异有个专门的名称，叫做速度差(/cha1/)。",
        annotation2: "差(/chā/)",
        result2: "其实这个速度差(/chā/)异有个专门的名称，叫做速度差(/chā/)。"
      },
      {
        text: "三角形A B C的周常可以表示为A B加B C加A C，代入切线相等的性质后。",
        annotation1: "切(/qie1/)",
        result1: "三角形A B C的周常可以表示为A B加B C加A C，代入切(/qie1/)线相等的性质后。",
        annotation2: "切(/**qiē**/)",
        result2: "三角形A B C的周常可以表示为A B加B C加A C，代入切(/**qiē**/)线相等的性质后。"
      },
      {
        text: "方案二的推导方法和方案一类似，看右边这个三脚形啊。",
        annotation1: "一(/yi1/)",
        result1: "方案二的推导方法和方案一(/yi1/)类似，看右边这个三角形啊。",
        annotation2: "一(/**yī**/)",
        result2: "方案二的推导方法和方案一(/**yī**/)类似，看右边这个三角形啊。"
      },
      {
        text: "负数的奇数次方结果还是负数，所以-1的2017次方就是-1。",
        annotation1: "奇(/ji1/)",
        result1: "负数的奇(/ji1/)数次方结果还是负数，所以-1的2017次方就是-1。",
        annotation2: "奇(/**jī**/)",
        result2: "负数的奇(/**jī**/)数次方结果还是负数，所以-1的2017次方就是-1。"
      },
      {
        text: "再想想，Rho1小于Rho2，这种情况下咱们学过的哪个口诀能用上呀？",
        annotation1: "Rho(/rəʊ/)",
        result1: "再想想，Rho(/rəʊ/)1小于Rho(/rəʊ/)2，这种情况下咱们学过的哪个口诀能用上呀？"
      }
    ]
  },
  
  corePrinciples: [
    {
      title: "格式规范",
      content: "目标(/注音/)。注音置于双斜线 // 内，使用英文半角括号 () 将注音内容括起来，并紧跟在目标字词之后，括号与字词、注音之间均无空格。例如：重(/chong2/)庆。"
    },
    {
      title: "精确匹配",
      content: "括号内的发音标注必须与括号前的字或词严格对应。修正单位仅支持：单个汉字、空格区分的英文单词或特定的儿化音组合。例如：重(/chong2/)、门儿(/menr2/)、apple(/'æpl/)、Let's(/lets/)。"
    },
    {
      title: "体系分离",
      content: "中文与英文使用两套独立的注音体系，不可混用。中文采用拼音，英文可采用国际音标（IPA）。"
    },
    {
      title: "最小干预",
      content: "修正应针对模型出错的特定单元进行，避免对整句进行不必要的标注，以保持文本的简洁性。"
    }
  ],

  chineseRules: {
    title: "中文发音修正",
    format: "汉字(/拼音+声调/)",
    tools: [
      { name: "汉典（网页版）", url: "https://www.zdic.net/" },
      { name: "新华字典（网页版）", url: "https://xhzd.net.cn/" }
    ],
    toneMethods: [
      {
        name: "数字标调法",
        description: "在音节末尾使用数字 1, 2, 3, 4, 5 分别表示阴平（一声）、阳平（二声）、上声（三声）、去声（四声）和轻声。",
        examples: ["妈(/ma1/)", "麻(/ma2/)", "马(/ma3/)", "骂(/ma4/)", "吗(/ma5/)"]
      },
      {
        name: "符号标调法",
        description: "使用声调符号 ¯ ˊ ˇ ˋ 直接标注在元音字母上。轻声仅支持数字标调法，以避免和英语 IPA 混淆。",
        examples: ["妈(/mā/)", "麻(/má/)", "马(/mǎ/)", "骂(/mà/)", "吗(/ma5/)"]
      }
    ],
    erhua: {
      description: "当\"儿\"与其前字视为一个整体进行注音时，拼音中用 r 表示儿化，声调标在原字音上。",
      examples: ["花儿(/huar1/) 或 花儿(/huār/)", "猫儿(/maor1/) 或 猫儿(/māor/)"]
    },
    examples: [
      {
        scenario: "修正单字多音",
        correct1: "图中(/zhong1/)哪个光路图是正确的？",
        correct2: "图中(/zhōng/)哪个光路图是正确的？",
        wrong: "图终哪个光路图是正确的？",
        reason: "汉字替换，会引起停顿、重音问题。"
      },
      {
        scenario: "修正多字多音",
        correct1: "重(/chong2/)庆是非常重(/zhong4/)要的城市。",
        correct2: "重(/chóng/)庆是非常重(/zhòng/)要的城市。",
        wrong: "重（/chóng/）庆是非常重（/zhòng/）要的城市。",
        reason: "使用了中文括号，开合都必须使用英文半角括号"
      },
      {
        scenario: "轻声",
        correct1: "吗(/ma5/)",
        wrong: "吗(/ma/)",
        reason: "轻声必须使用数字标调法，以避免和 IPA 混淆。"
      },
      {
        scenario: "处理儿化音",
        correct1: "这小猫儿(/maor1/)真乖。",
        correct2: "这小猫儿(/māor/)真乖。",
        wrong: "小猫(/mao1/)儿(/er 5/)真乖。",
        reason: "错误地将儿化音拆分为两个独立注音。"
      }
    ]
  },

  englishRules: {
    title: "英文发音修正",
    format: "word(/pronunciation/)",
    description: "针对英文单词(数学、物理、化学常用的希腊语符号如果非英语单词，需要先转成英语单词，比如ρ-> Rho)，提供其音标，可以参考上面工具获取对应的国际音频写法。",
    tool: { name: "朗文词典", url: "https://www.ldoceonline.com/dictionary" },
    ipaDescription: "使用朗文词典给的音标符号（简化版的标准国际音标）。另外，请给单音节词音标额外加一个主重音标记(ˈ)，且用\".\"将不同音节分开。",
    examples: ["the(/ˈðə/)", "apple(/ˈæ.pəl/)", "read(/ˈriːd/)"],
    examplesTable: [
      {
        scenario: "单个词",
        correct: "apple(/ˈæ.pəl/)",
        wrong: ["apple(/ˈæ.pəl/", "apple(/ˈæpəl/)", "apple(/æ.pəl/)"],
        reasons: ["缺后括号", "缺音节分割符号", "缺重音符号"]
      },
      {
        scenario: "多音词（同词义）",
        correct: "I ate the(/ˈðə/) apple and the(/ˈðiː/) egg.",
        wrong: ["the egg(/ˈðiː/)", "the(/ðə/)"],
        reasons: ["注音位置错误", "单音节没有额外加主重音"]
      },
      {
        scenario: "多音词（不同词义）",
        correct: "I will record(/rɪˈ.kɔːd/) a new record(/ˈre.kɔːd/) today.",
        wrong: "I will record(/rɪˈ.kɔːd/) a new record(/rɪˈ.kɔːd/) today.",
        reason: "提供了一样的发音，但是实际上这个词不同词性发音有区别。"
      },
      {
        scenario: "专有名词",
        correct: "She bought a pair of Nike(/ˈnaɪ.ki/) shoes.",
        wrong: "Nike(/ˈnaɪk/)",
        reason: "会按照提供的发音读，而不是这个词的正确发音。"
      }
    ]
  },

  advancedCases: {
    title: "疑难Case与进阶策略",
    description: "此列表用于统计使用过程中发现的问题及其解决方案。",
    cases: [
      {
        scenario: "英文缩写词",
        description: "中间无空格，分字母读",
        strategy: "提供一个音标",
        example: "请打开这个PDF(/ˌpiː.diːˈef/)文档"
      },
      {
        scenario: "英文缩写词",
        description: "中间无空格，当做独立词读",
        strategy: "提供一个音标",
        example: "美国的NASA(/ˈnæsə/)"
      },
      {
        scenario: "英文缩写词",
        description: "中间有空格",
        strategy: "按字母提供音标",
        example: "跟着老师读：H(/eɪtʃ/) O(/əʊ/) W - how"
      },
      {
        scenario: "中英文混合句",
        description: "中英文都容易读错",
        strategy: "分别对中、英文部分按其规则进行独立修正。",
        example: "请打开这个PDF(/ˌpiː.diːˈef/)文档(/dang4/)。"
      },
      {
        scenario: "多音字密集",
        description: "一句话里面有多个多音字",
        strategy: "对句中每个需要纠正的多音字进行单独标注。",
        example: "他长(/zhang3/)了一副长(/chang2/)脸。"
      },
      {
        scenario: "特殊符号与数字",
        description: "文本中有多读音的数字或者符号。",
        strategy: "将数字、符号转成文本格式。",
        examples: [
          "足球比分是：12-8。 => 足球比分是：十二比八。",
          "小明上了2楼。 => 小明上了二楼。",
          "∠A的度数是三十度。=> 角A的度数是三十度。"
        ]
      },
      {
        scenario: "特殊符号与数字",
        description: "文本中有非英语、中文文本的符号。",
        strategy: "将符号转成文本格式。",
        example: "再想想，ρ1小于ρ2，这种情况下咱们学过的哪个口诀能用上呀？ => 再想想，Rho1小于Rho2，这种情况下咱们学过的哪个口诀能用上呀？"
      }
    ]
  },

  appendix: {
    chinese: {
      title: "中文声韵母简表",
      teaching: {
        description: "教学上，汉语拼音共有63个，其中声母23,韵母24个(单韵母6个，复韵母8个,特殊韵母1个，前鼻韵母5个，后鼻韵母4个,）整体认读音节16个。",
        initials: "b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, y, w",
        singleVowels: "a, o, e, i, u, ü",
        compoundVowels: "ai, ei, ui, ao, ou, iu, ie, üe, er, an, en, in, un, ün, ang, eng, ing, ong",
        wholeSyllables: "zhi, chi, shi, ri, zi, ci, si, yi, wu, yu, ye, yue, yin, yun, yuan, ying",
        notes: [
          "拼音 ü 在键盘输入时通常用 v 代替（如：\"吕\" lv3 , lǚ）。",
          "拼音 j, q, x, y 加 ü 的时候，ü 会去掉两点变成 u （如：\"句\" jù），支持 jv，ju 两种写法，v , u 都指向 ü 的发音。",
          "汉字\"嗯\"的拼音写为 ng。"
        ]
      },
      model: {
        description: "模型识别上，普通话有 27 个声母和 38 个韵母（不带声调）。",
        initials: "b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s, _a, _o, _e, _y, _w, _v(ü)",
        vowels: "a, o, e, i, -i(前)， -i(后), u, v(ü), er, ai, ei, ui, ao, ou, iu, ie, ve(üe), iao, iou, uai, uei, an, ian, uan, van(üan), en, in, vn(ün), ang, iang, uang, eng, ing, ueng, ong, iong"
      }
    },
    english: {
      title: "英语 IPA 与 CMU 对照表",
      description: "目前仅支持第一列 IPA 写法，且不支持其中的纯英式发音 IPA。",
      note: "单音节的音标不需要标注音节分隔或重音符号；多音节的音标需要用\".\"隔开音节，并标出重音符号，具体要求如下：\n1. 一个多音节单词内部有且只能有一个主重音标记（ˈ）\n2. 次重音标记（ˌ）不是必要出现的，仅在有次重音的单词中需要标出\n3. 主重音标记和次重音标记需要写在该音节首\n4. 一个音节内部只能有一个元音。\n例如：\n- /bəˈnænə/需要标成/bə.ˈnæ.nə/\n- /ɪntərnæʃənəl/需要标成/ˌɪn.tər.ˈnæ.ʃə.nəl/",
      ipaTable: [
        { ipa: "/iː/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ɪ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/e/", type: "Vowel", note: "英音,美音" },
        { ipa: "/æ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ɚ/", type: "Vowel", note: "美音" },
        { ipa: "/ə/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ʌ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/uː/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ʊ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ɔː/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ɑː/", type: "Vowel", note: "英音,美音" },
        { ipa: "/eɪ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/aɪ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/ɔɪ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/aʊ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/əʊ/", type: "Vowel", note: "英音,美音" },
        { ipa: "/p/", type: "Consonant", note: "英音,美音" },
        { ipa: "/t/", type: "Consonant", note: "英音,美音" },
        { ipa: "/k/", type: "Consonant", note: "英音,美音" },
        { ipa: "/b/", type: "Consonant", note: "英音,美音" },
        { ipa: "/d/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ɡ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/f/", type: "Consonant", note: "英音,美音" },
        { ipa: "/s/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ʃ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ʒ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/θ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/h/", type: "Consonant", note: "英音,美音" },
        { ipa: "/v/", type: "Consonant", note: "英音,美音" },
        { ipa: "/z/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ð/", type: "Consonant", note: "英音,美音" },
        { ipa: "/r/", type: "Consonant", note: "英音,美音" },
        { ipa: "/tʃ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/dʒ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/tr/", type: "Consonant", note: "英音,美音" },
        { ipa: "/dr/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ts/", type: "Consonant", note: "英音,美音" },
        { ipa: "/dz/", type: "Consonant", note: "英音,美音" },
        { ipa: "/m/", type: "Consonant", note: "英音,美音" },
        { ipa: "/n/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ŋ/", type: "Consonant", note: "英音,美音" },
        { ipa: "/l/", type: "Consonant", note: "英音,美音" },
        { ipa: "/j/", type: "Consonant", note: "英音,美音" },
        { ipa: "/w/", type: "Consonant", note: "英音,美音" },
        { ipa: "/ɪr/", type: "Vowel", note: "美音" },
        { ipa: "/er/", type: "Vowel", note: "美音" },
        { ipa: "/ʊr/", type: "Vowel", note: "美音" }
      ]
    }
  }
};
