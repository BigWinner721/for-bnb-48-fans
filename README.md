 一些关于bnb-48-fans的小工具，欢迎补充，聊天
==========================

## 有dune方法 ，更为高效，但不充钱就有一些小问题。分享一些小工具如下

    //查一个地址 有效mint的hash   https://dune.com/queries/3269353/5472487
    //查一个mint出来的铭文是否被双花&假发送 https://dune.com/queries/3269503/5472738
    //查一次bnb-48-fans转账后的真货（有一定条件 ）https://dune.com/queries/3270571/5474434
    //我实际想用dune直接查持仓，计算量超过两分钟就失败了，不知道充钱用户会不会更好 ？

## scripts

* 1-check.js 用于检查一个hash是否有效，用于mint出来的账户检查真货
* 2-gethashs.js 用于爬取evm.ink中检索到某个地址目前持有的铭文所有的hash，
    * 到这里可以找出一个用户收取过的所有有效的铭文（注意会包含假发送和双花 ）hash https://dune.com/queries/3271386/5475821
* 3-getrhashs.js 用于爬取一个用户收过的/打出的/发出的所有铭文，需要你会使用dune，里面是我的示例
* 4-merge.js 结合上面两条获得的数据 用于找出当前用户持有的真实bnb48-fans铭文，或者也可以查假铭文 
