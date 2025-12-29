'use client';

import { pronunciationRules } from '@/lib/rules';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          {/* 标题和版本信息 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {pronunciationRules.title}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>版本 {pronunciationRules.version}</p>
              <p>更新日期：{pronunciationRules.updateDate}</p>
              <p>修订者：{pronunciationRules.authors.join(' ')}</p>
            </div>
          </div>

          {/* 引言 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {pronunciationRules.introduction.title}
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">{pronunciationRules.introduction.content}</p>
              <p className="text-sm text-gray-600">{pronunciationRules.introduction.note}</p>
            </div>
          </section>

          {/* 新方案 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">新方案</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">文本</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">注音方案（汉语二选一，英语 IPA）</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">修正后文本</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pronunciationRules.newSolution.examples.map((example, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{example.text}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{example.annotation1}</code>
                          {example.annotation2 && (
                            <code className="bg-blue-100 px-2 py-1 rounded text-xs block">{example.annotation2}</code>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">{example.result1}</code>
                          {example.result2 && (
                            <code className="bg-green-100 px-2 py-1 rounded text-xs block">{example.result2}</code>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 核心原则 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">一、核心原则</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="font-semibold text-yellow-900">
                发音修正功能的设计遵循以下核心原则，请在使用前务必阅读：
              </p>
            </div>
            <div className="space-y-4">
              {pronunciationRules.corePrinciples.map((principle, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">{index + 1}. {principle.title}</h3>
                  <p className="text-blue-800 text-sm">{principle.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 分类与示例 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">二、分类与示例</h2>
            
            {/* 中文发音修正 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. {pronunciationRules.chineseRules.title}
              </h3>
              
              {/* 查询工具推荐 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">查询工具推荐：</p>
                <ul className="space-y-1">
                  {pronunciationRules.chineseRules.tools.map((tool, i) => (
                    <li key={i}>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {tool.name} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>基本格式：</strong>{pronunciationRules.chineseRules.format}
                </p>
                <p className="text-sm text-gray-700">
                  针对中文字符，使用汉语拼音进行标注，并必须提供声调信息。您可以根据顺手程度，在数字标调法或符号标调法中任选一种。
                </p>
              </div>
              
              <div className="space-y-4 mb-4">
                {pronunciationRules.chineseRules.toneMethods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{method.name}</h4>
                    <p className="text-sm text-gray-700 mb-3">{method.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {method.examples.map((example, i) => (
                        <code key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {example}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-900 mb-2">儿化音处理</h4>
                <p className="text-sm text-yellow-800 mb-2">
                  {pronunciationRules.chineseRules.erhua.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pronunciationRules.chineseRules.erhua.examples.map((example, i) => (
                    <code key={i} className="bg-yellow-100 px-2 py-1 rounded text-sm">
                      {example}
                    </code>
                  ))}
                </div>
              </div>

              {/* 中文示例表格 */}
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">场景</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">拼音+数字标调法（正样例）</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">拼音+标调法（正样例）</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">负样例</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">负样例解析</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pronunciationRules.chineseRules.examples.map((example, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{example.scenario}</td>
                        <td className="px-3 py-2">
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">{example.correct1}</code>
                        </td>
                        <td className="px-3 py-2">
                          {example.correct2 ? (
                            <code className="bg-green-100 px-2 py-1 rounded text-xs">{example.correct2}</code>
                          ) : (
                            <span className="text-gray-400">/</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <code className="bg-red-100 px-2 py-1 rounded text-xs">{example.wrong}</code>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{example.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 英文发音修正 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. {pronunciationRules.englishRules.title}
              </h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">查询工具推荐：</p>
                <a
                  href={pronunciationRules.englishRules.tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {pronunciationRules.englishRules.tool.name} →
                </a>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>基本格式：</strong>{pronunciationRules.englishRules.format}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  {pronunciationRules.englishRules.description}
                </p>
                <p className="text-sm text-gray-700">
                  {pronunciationRules.englishRules.ipaDescription}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {pronunciationRules.englishRules.examples.map((example, i) => (
                  <code key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {example}
                  </code>
                ))}
              </div>

              {/* 英文示例表格 */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">场景</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">IPA（正样例）</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">IPA（负样例）</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">负样例解析</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pronunciationRules.englishRules.examplesTable.map((example, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{example.scenario}</td>
                        <td className="px-3 py-2">
                          <code className="bg-green-100 px-2 py-1 rounded text-xs">{example.correct}</code>
                        </td>
                        <td className="px-3 py-2">
                          {Array.isArray(example.wrong) ? (
                            <div className="space-y-1">
                              {example.wrong.map((w, i) => (
                                <code key={i} className="bg-red-100 px-2 py-1 rounded text-xs block">{w}</code>
                              ))}
                            </div>
                          ) : (
                            <code className="bg-red-100 px-2 py-1 rounded text-xs">{example.wrong}</code>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {Array.isArray(example.reasons) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {example.reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          ) : (
                            example.reason
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 疑难Case与进阶策略 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">三、疑难Case与进阶策略</h2>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-4">
              <p className="text-sm text-gray-700 italic">
                {pronunciationRules.advancedCases.description}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">场景</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">描述</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">解决策略</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">示例</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pronunciationRules.advancedCases.cases.map((caseItem, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{caseItem.scenario}</td>
                      <td className="px-3 py-2 text-gray-600">{caseItem.description}</td>
                      <td className="px-3 py-2 text-gray-600">{caseItem.strategy}</td>
                      <td className="px-3 py-2">
                        {caseItem.example ? (
                          <code className="bg-blue-100 px-2 py-1 rounded text-xs">{caseItem.example}</code>
                        ) : caseItem.examples ? (
                          <div className="space-y-1">
                            {caseItem.examples.map((ex, i) => (
                              <code key={i} className="bg-blue-100 px-2 py-1 rounded text-xs block">{ex}</code>
                            ))}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 附录A：参考发音表 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">附录A：参考发音表</h2>
            
            {/* 中文声韵母简表 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                A1. {pronunciationRules.appendix.chinese.title}
              </h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">教学上</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {pronunciationRules.appendix.chinese.teaching.description}
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">声母（23个）：</p>
                    <p className="text-gray-600">{pronunciationRules.appendix.chinese.teaching.initials}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">单韵母（6个）：</p>
                    <p className="text-gray-600">{pronunciationRules.appendix.chinese.teaching.singleVowels}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">复韵母（18个）：</p>
                    <p className="text-gray-600">{pronunciationRules.appendix.chinese.teaching.compoundVowels}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">整体认读音节（16个）：</p>
                    <p className="text-gray-600">{pronunciationRules.appendix.chinese.teaching.wholeSyllables}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="font-medium text-gray-700 mb-2">特殊说明：</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {pronunciationRules.appendix.chinese.teaching.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">模型识别上</h4>
                <p className="text-sm text-blue-800 mb-3">
                  {pronunciationRules.appendix.chinese.model.description}
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900 mb-1">声母（27个）：</p>
                    <p className="text-blue-800">{pronunciationRules.appendix.chinese.model.initials}</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 mb-1">韵母（38个）：</p>
                    <p className="text-blue-800">{pronunciationRules.appendix.chinese.model.vowels}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 英语 IPA 与 CMU 对照表 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                A2. {pronunciationRules.appendix.english.title}
              </h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>⚠️ 注意：</strong>{pronunciationRules.appendix.english.description}
                </p>
                <p className="text-xs text-yellow-700 whitespace-pre-line">
                  {pronunciationRules.appendix.english.note}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">IPA</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">类型</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pronunciationRules.appendix.english.ipaTable.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{item.ipa}</code>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{item.type}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
