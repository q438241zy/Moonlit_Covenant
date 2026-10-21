import os
# 重新生成 99_整合设定集.md：分类文件一改就运行一次（python3 设定集/gen99.py），并同步 MANIFEST.txt。
D=os.path.dirname(os.path.abspath(__file__))+'/'
names=['00_总览与目录.md','01_核心企划与叙事支柱.md','02_世界观与历史.md','03_主角与八位女主角.md','04_阵营与关键NPC.md','05_五心系统与主线谜团.md','06_战斗职业魔法与装备.md','07_怪物与Boss图鉴.md','08_世界地图城镇与支线.md','09_主线剧情30章总纲.md','11_AI互动好感与结局.md','12_编剧格式与制作规范.md','13_共同编剧与试玩流程.md','CHANGELOG_v0.4.md']
for n in names: assert os.path.exists(D+n), n
head='''# 《月蚀契约》剧情设定整合集 v0.4

> **v0.4（2026-10-21，核#13/#14）：** 本文件由分类Markdown自动整合，于2026-10-21按核#14第1项（“设定集（00–12与99副本、CHANGELOG）改为30章结构”）与提案第九节（“99整合本与CHANGELOG同步”）重新整合。收录下列分类文件的v0.4全文，逐字照录、不改写；不收冻结的 `09B_旧100章总纲_第二部候选（冻结）.md`，也不收旧v0.3整合本 `99B_v0.3整合设定集（冻结）.md`（原名本文件，旧引用“99:N”指99B）。若与分类文件冲突，以对应分类文件与CHANGELOG为准；本文件不引行号，分类文件一改就整份重新生成，并同步 `MANIFEST.txt`。  
> **当前剧本权威提示：** `剧本/` 文件夹中的正式00–10（`00起源.md`–`10下水道的潮聲.md`）为正式稿（核#7、#10、#11、#14），一字不改，优先于本整合集；正式11–30以 `09_主线剧情30章总纲.md` 为准。

## 文件目录

''' + '\n'.join(f'- `{n}`' for n in names) + '\n'
out=head
for n in names:
    c=open(D+n,encoding='utf-8').read().rstrip('\n')
    out+=f'\n\n---\n\n\n<!-- SOURCE: {n} -->\n\n\n'+c+'\n'
open(D+'99_整合设定集.md','w',encoding='utf-8').write(out)
print(len(out.encode('utf-8')), out.count('\n'))
