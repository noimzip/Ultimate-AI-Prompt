# Ultimate AI Prompt（日本語版）

このリポジトリは、LLM向けの実用プロンプトをカテゴリ別にまとめたコレクションです。  
`en/` と `ja/` に同テーマの英語版・日本語版を配置し、`gem/` と `notebooklm/` で用途を分けています。

## 構成

| ディレクトリ | 内容 |
| --- | --- |
| `en/gem` | 高負荷な深掘り調査・分析・ロールプレイ系プロンプト（英語） |
| `en/notebooklm` | 学習支援（要約・予習・試験予測・ノート診断）系プロンプト（英語） |
| `ja/gem` | `en/gem` の日本語版 |
| `ja/notebooklm` | `en/notebooklm` の日本語版 |

## プロンプト一覧（全22ファイル）

以下はテーマ単位の対応表です。各行で英語版1ファイル + 日本語版1ファイル（計11テーマ = 22ファイル）を網羅しています。

| テーマ | 英語ファイル | 日本語ファイル | 概要 |
| --- | --- | --- | --- |
| 事業分析（VC/PO/Risk） | `en/gem/highest-business-analysis.md` | `ja/gem/highest-business-analysis.md` | VC・プロダクト責任者・リスク分析官の3視点で、批判→議論→統合提案まで行うビジネス分析プロンプト。 |
| ロールプレイ特化 | `en/gem/rule-bending-roleplay.md` | `ja/gem/rule-bending-roleplay.md` | 没入感重視の長文ロールプレイを強く要求するプロンプト。 |
| 超高精度ディープリサーチ | `en/gem/highest-precision-deep-research.md` | `ja/gem/highest-precision-deep-research.md` | 一次情報中心の再帰的調査と自己批判ループを要求する調査プロンプト。 |
| Gemini超高負荷思考 | `en/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | `ja/gem/gem-3.1-ultra-hyper-pro-max-thinking.md` | 大規模コンテキスト・反復検索・厳密な調査プロトコルを要求する研究向けプロンプト。 |
| Claude人格化 | `en/gem/gemlaude-sonnet-4.6.md` | `ja/gem/gemlaude-sonnet-4.6.md` | Claude Sonnet 4.6としての応答姿勢・思考原則・文体ルールを指定するプロンプト。 |
| 次回授業の予習設計 | `en/notebooklm/preparation.md` | `ja/notebooklm/preparation.md` | 過去資料の進行から次回授業を予測し、予習ガイドを作るプロンプト。 |
| 高密度要約（CoD） | `en/notebooklm/summary.md` | `ja/notebooklm/summary.md` | Chain of Density を使って、長さを維持しながら情報密度を高める要約プロンプト。 |
| ノート品質診断 | `en/notebooklm/notebook-review.md` | `ja/notebooklm/notebook-review.md` | コーネル式評価でノートを採点し、改善策と理想ノート例を提示するプロンプト。 |
| 試験問題予測 | `en/notebooklm/predicting-exam-questions.md` | `ja/notebooklm/predicting-exam-questions.md` | Bloom分類に基づく出題予測・模擬試験・模範解答を作るプロンプト。 |
| 小学生向け説明（Feynman） | `en/notebooklm/elementary-school-student-can-understand.md` | `ja/notebooklm/elementary-school-student-can-understand.md` | 難解概念を12歳向けに比喩で説明する再構成プロンプト。 |
| 学習優先度決定 | `en/notebooklm/determining-study-priorities.md` | `ja/notebooklm/determining-study-priorities.md` | 重要度・難易度・出題確率で優先度を算出し、学習ロードマップを作るプロンプト。 |

## 使い方

1. 目的に合う `.md` を開く。  
2. 内容をシステムプロンプト/指示文として貼り付ける。  
3. テーマや入力資料（ノート、PDF、課題など）を追加して実行する。  

## 注意事項

- 一部プロンプトには、**出力量の極端な増加**や**安全制約の緩和/回避を強く示唆する記述**が含まれます。利用先の規約・法令・運用ポリシーに従って使用してください。  
- `ja/notebooklm` の一部ファイルは改行が少ない体裁ですが、内容テーマは英語版と対応しています。  
