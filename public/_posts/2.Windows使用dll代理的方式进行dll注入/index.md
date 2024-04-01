---
title: Windows使用dll代理的方式进行dll注入
date: 3/12/2024 12:45:00
description: 利用Windows的寻库机制来实现对系统dll的代理实现dll注入
keywords: Windows,底层,dll注入
tags: Windows
categories: Windows
---

本文将给出利用Windows的寻库原理来代理系统的相关库文件来达到dll注入目的

- 构建工具: xmake
- 编程语言：C语言
- 代理对象：dbghelp.dll

## 首先我们需要使用 dumpbin 命令来查看系统的 dbghelp.dll 有什么导出函数

使用`dumpbin /exports C:\Windows\System32\dbghelp.dll`命令来获取系统里dbghelp.dll的导出函数

输出可能类似于下面的内容：

```plaintext
PS C:\Program Files\Microsoft Visual Studio\2022\Enterprise> dumpbin /exports C:\Windows\System32\dbghelp.dll
Microsoft (R) COFF/PE Dumper Version 14.39.33521.0
Copyright (C) Microsoft Corporation.  All rights reserved.


Dump of file C:\Windows\System32\dbghelp.dll

File Type: DLL

  Section contains the following exports for dbghelp.dll

    00000000 characteristics
    9A866525 time date stamp
        0.00 version
        1101 ordinal base
         257 number of functions
         242 number of names

    ordinal hint RVA      name

       1126    0 0012EB10 DbgHelpCreateUserDump
       1127    1 0012EC10 DbgHelpCreateUserDumpW
       1128    2 00127CE0 EnumDirTree
       1129    3 00127E10 EnumDirTreeW
       1130    4 001214A0 EnumerateLoadedModules
       1131    5 001214A0 EnumerateLoadedModules64
       1132    6 00121500 EnumerateLoadedModulesEx
       1133    7 00121560 EnumerateLoadedModulesExW
       1134    8 001215C0 EnumerateLoadedModulesW64
       1135    9 00116420 ExtensionApiVersion
       1136    A 00127E60 FindDebugInfoFile
       1137    B 00127E80 FindDebugInfoFileEx
       1138    C 00127F50 FindDebugInfoFileExW
       1139    D 00127FA0 FindExecutableImage
       1140    E 00127FC0 FindExecutableImageEx
       1141    F 001280C0 FindExecutableImageExW
       1142   10 00128110 FindFileInPath
       1143   11 00128160 FindFileInSearchPath
       1144   12 00121620 GetSymLoadError
       1145   13 001186E0 GetTimestampForLoadedLibrary
       1146   14 00118360 ImageDirectoryEntryToData
       1147   15 00118380 ImageDirectoryEntryToDataEx
       1148   16 001184B0 ImageNtHeader
       1149   17 001184F0 ImageRvaToSection
       1150   18 00118560 ImageRvaToVa
       1151   19 001281B0 ImagehlpApiVersion
       1152   1A 001281C0 ImagehlpApiVersionEx
       1153   1B 00128200 MakeSureDirectoryPathExists
       1154   1C          MiniDumpReadDumpStream (forwarded to dbgcore.MiniDumpReadDumpStream)
       1155   1D          MiniDumpWriteDump (forwarded to dbgcore.MiniDumpWriteDump)
       1156   1E 001404D0 RangeMapAddPeImageSections
       1157   1F 00140590 RangeMapCreate
       1158   20 001405F0 RangeMapFree
       1159   21 00140610 RangeMapRead
       1160   22 00140670 RangeMapRemove
       1161   23 001406C0 RangeMapWrite
       1162   24 00018EF0 RemoveInvalidModuleList
       1163   25 00111910 ReportSymbolLoadSummary
       1164   26 00128390 SearchTreeForFile
       1165   27 001283C0 SearchTreeForFileW
       1166   28 00018EF0 SetCheckUserInterruptShared
       1167   29 00121630 SetSymLoadError
       1168   2A 0000DBF0 StackWalk
       1169   2B 0000DBF0 StackWalk64
       1170   2C 0000DD70 StackWalkEx
       1171   2D 00121640 SymAddSourceStream
       1172   2E 00121650 SymAddSourceStreamA
       1173   2F 001216C0 SymAddSourceStreamW
       1174   30 00121860 SymAddSymbol
       1175   31 001218E0 SymAddSymbolW
       1176   32 001219F0 SymAddrIncludeInlineTrace
       1111   33 0011FA60 SymAllocDiaString
       1177   34 0000DBA0 SymCleanup
       1178   35 00121B70 SymCompareInlineTrace
       1179   36 001220C0 SymDeleteSymbol
       1180   37 00122130 SymDeleteSymbolW
       1181   38 00122220 SymEnumLines
       1182   39 001222F0 SymEnumLinesW
       1183   3A 00122360 SymEnumProcesses
       1184   3B 00122400 SymEnumSourceFileTokens
       1185   3C 001224B0 SymEnumSourceFiles
       1186   3D 001224E0 SymEnumSourceFilesW
       1187   3E 00122510 SymEnumSourceLines
       1188   3F 00122560 SymEnumSourceLinesW
       1189   40 001225B0 SymEnumSym
       1190   41 001225E0 SymEnumSymbols
       1191   42 00122610 SymEnumSymbolsEx
       1192   43 001226B0 SymEnumSymbolsExW
       1193   44 00122720 SymEnumSymbolsForAddr
       1194   45 00122850 SymEnumSymbolsForAddrW
       1195   46 00122990 SymEnumSymbolsW
       1196   47 001229C0 SymEnumTypes
       1197   48 00122A10 SymEnumTypesByName
       1198   49 00122AE0 SymEnumTypesByNameW
       1199   4A 00122B40 SymEnumTypesW
       1200   4B 00122B90 SymEnumerateModules
       1201   4C 00122B90 SymEnumerateModules64
       1202   4D 00122BD0 SymEnumerateModulesW64
       1203   4E 00122C10 SymEnumerateSymbols
       1204   4F 00122C10 SymEnumerateSymbols64
       1205   50 00122C60 SymEnumerateSymbolsW
       1206   51 00122C60 SymEnumerateSymbolsW64
       1207   52 001283F0 SymFindDebugInfoFile
       1208   53 001284E0 SymFindDebugInfoFileW
       1209   54 00128570 SymFindExecutableImage
       1210   55 00128670 SymFindExecutableImageW
       1211   56 00128700 SymFindFileInPath
       1212   57 00128840 SymFindFileInPathW
       1112   58 0011FD20 SymFreeDiaString
       1213   59 00122CB0 SymFromAddr
       1214   5A 00122CE0 SymFromAddrW
       1215   5B 00122D10 SymFromIndex
       1216   5C 00122D80 SymFromIndexW
       1217   5D 00122E80 SymFromInlineContext
       1218   5E 00122EE0 SymFromInlineContextW
       1219   5F 00019330 SymFromName
       1220   60 00122F40 SymFromNameW
       1221   61 00122F70 SymFromToken
       1222   62 00123020 SymFromTokenW
       1223   63 0000E6E0 SymFunctionTableAccess
       1224   64 0000E6E0 SymFunctionTableAccess64
       1225   65 0000E700 SymFunctionTableAccess64AccessRoutines
       1113   66 0011FD30 SymGetDiaSession
       1226   67 00123130 SymGetExtendedOption
       1227   68 0011AA40 SymGetFileLineOffsets64
       1228   69 00123150 SymGetHomeDirectory
       1229   6A 001231D0 SymGetHomeDirectoryW
       1230   6B 00123290 SymGetLineFromAddr
       1231   6C 00123290 SymGetLineFromAddr64
       1114   6D 0011FDE0 SymGetLineFromAddrEx
       1232   6E 001232C0 SymGetLineFromAddrW64
       1233   6F 001232F0 SymGetLineFromInlineContext
       1234   70 00123330 SymGetLineFromInlineContextW
       1235   71 00123370 SymGetLineFromName
       1236   72 00123370 SymGetLineFromName64
       1120   73 001200D0 SymGetLineFromNameEx
       1237   74 001233A0 SymGetLineFromNameW64
       1238   75 001233D0 SymGetLineNext
       1239   76 001233D0 SymGetLineNext64
       1121   77 00120800 SymGetLineNextEx
       1240   78 001233E0 SymGetLineNextW64
       1241   79 00123400 SymGetLinePrev
       1242   7A 00123400 SymGetLinePrev64
       1122   7B 001208A0 SymGetLinePrevEx
       1243   7C 00123410 SymGetLinePrevW64
       1244   7D 0000F480 SymGetModuleBase
       1245   7E 0000F480 SymGetModuleBase64
       1246   7F 00123430 SymGetModuleInfo
       1247   80 00123430 SymGetModuleInfo64
       1248   81 000104E0 SymGetModuleInfoW
       1249   82 000104E0 SymGetModuleInfoW64
       1123   83 00120930 SymGetOmapBlockBase
       1250   84 001234C0 SymGetOmaps
       1251   85 00018D40 SymGetOptions
       1252   86 001235B0 SymGetScope
       1253   87 00123630 SymGetScopeW
       1254   88 00123760 SymGetSearchPath
       1255   89 001237F0 SymGetSearchPathW
       1256   8A 00123860 SymGetSourceFile
       1257   8B 001238E0 SymGetSourceFileChecksum
       1258   8C 00123970 SymGetSourceFileChecksumW
       1259   8D 00123AA0 SymGetSourceFileFromToken
       1260   8E 00123B50 SymGetSourceFileFromTokenW
       1261   8F 00123BD0 SymGetSourceFileToken
       1262   90 00123C40 SymGetSourceFileTokenW
       1263   91 00123D10 SymGetSourceFileW
       1264   92 00123D90 SymGetSourceVarFromToken
       1265   93 00123E60 SymGetSourceVarFromTokenW
       1266   94 00123F10 SymGetSymFromAddr
       1267   95 00123F10 SymGetSymFromAddr64
       1268   96 00123F50 SymGetSymFromName
       1269   97 00123F50 SymGetSymFromName64
       1270   98 00123FC0 SymGetSymNext
       1271   99 00123FC0 SymGetSymNext64
       1272   9A 00123FE0 SymGetSymPrev
       1273   9B 00123FE0 SymGetSymPrev64
       1274   9C 0012D480 SymGetSymbolFile
       1275   9D 0012D5B0 SymGetSymbolFileW
       1276   9E 00123FF0 SymGetTypeFromName
       1277   9F 001240A0 SymGetTypeFromNameW
       1278   A0 00124210 SymGetTypeInfo
       1279   A1 00124250 SymGetTypeInfoEx
       1280   A2 00124280 SymGetUnwindInfo
       1281   A3 000115E0 SymInitialize
       1282   A4 000177B0 SymInitializeW
       1283   A5 0001A900 SymLoadModule
       1284   A6 0001A900 SymLoadModule64
       1285   A7 0001A940 SymLoadModuleEx
       1286   A8 00124410 SymLoadModuleExW
       1287   A9 00124470 SymMatchFileName
       1288   AA 00124580 SymMatchFileNameW
       1289   AB 00124670 SymMatchString
       1290   AC 001246B0 SymMatchStringA
       1291   AD 001246C0 SymMatchStringW
       1292   AE 00124700 SymNext
       1293   AF 001247A0 SymNextW
       1294   B0 001247C0 SymPrev
       1295   B1 00124860 SymPrevW
       1296   B2 00124870 SymQueryInlineTrace
       1297   B3 00124B80 SymRefreshModuleList
       1298   B4 00124C00 SymRegisterCallback
       1299   B5 00124C00 SymRegisterCallback64
       1300   B6 00124C80 SymRegisterCallbackW64
       1301   B7 00124D10 SymRegisterFunctionEntryCallback
       1302   B8 00124D10 SymRegisterFunctionEntryCallback64
       1303   B9 00124D90 SymSearch
       1304   BA 00124E50 SymSearchW
       1305   BB 00124ED0 SymSetContext
       1124   BC 001209B0 SymSetDiaSession
       1306   BD 00124F90 SymSetExtendedOption
       1307   BE 00124FC0 SymSetHomeDirectory
       1308   BF 00125060 SymSetHomeDirectoryW
       1309   C0 00017C40 SymSetOptions
       1310   C1 001250E0 SymSetParentWindow
       1311   C2 00125110 SymSetScopeFromAddr
       1312   C3 00125120 SymSetScopeFromIndex
       1313   C4 001251E0 SymSetScopeFromInlineContext
       1314   C5 001252A0 SymSetSearchPath
       1315   C6 00017450 SymSetSearchPathW
       1316   C7 0012DA60 SymSrvDeltaName
       1317   C8 0012DB30 SymSrvDeltaNameW
       1318   C9 0012DCD0 SymSrvGetFileIndexInfo
       1319   CA 0012DDB0 SymSrvGetFileIndexInfoW
       1320   CB 0012DEF0 SymSrvGetFileIndexString
       1321   CC 0012DFB0 SymSrvGetFileIndexStringW
       1322   CD 0012E080 SymSrvGetFileIndexes
       1323   CE 0012E0F0 SymSrvGetFileIndexesW
       1324   CF 0012E1B0 SymSrvGetSupplement
       1325   D0 0012E270 SymSrvGetSupplementW
       1326   D1 0012E390 SymSrvIsStore
       1327   D2 0012E3E0 SymSrvIsStoreW
       1328   D3 0012E520 SymSrvStoreFile
       1329   D4 0012E5C0 SymSrvStoreFileW
       1330   D5 0012E680 SymSrvStoreSupplement
       1331   D6 0012E750 SymSrvStoreSupplementW
       1332   D7 001252F0 SymUnDName
       1333   D8 001252F0 SymUnDName64
       1334   D9 00125350 SymUnloadModule
       1335   DA 00125350 SymUnloadModule64
       1336   DB 00008380 UnDecorateSymbolName
       1337   DC 00125440 UnDecorateSymbolNameW
       1338   DD 00116510 WinDbgExtensionDllInit
       1125   DE 00112070 _EFN_DumpImage
       1339   DF 00116560 block
       1340   E0 00116730 chksym
       1341   E1 00125580 dbghelp
       1342   E2 00116920 dh
       1343   E3 00116930 fptr
       1344   E4 001169C0 homedir
       1345   E5 00116AF0 inlinedbg
       1346   E6 00116B60 itoldyouso
       1347   E7 00116D50 lmi
       1348   E8 00117070 lminfo
       1349   E9 00117290 omap
       1350   EA 001174B0 optdbgdump
       1351   EB 00117600 optdbgdumpaddr
       1352   EC 00117750 srcfiles
       1353   ED 00117880 stack_force_ebp
       1354   EE 001179F0 stackdbg
       1355   EF 00117BC0 sym
       1356   F0 00117D10 symsrv
       1357   F1 00117D60 vc7fpo
       1101      0011FBA0 [NONAME]
       1102      0011FC90 [NONAME]
       1103      0011FE20 [NONAME]
       1104      001201A0 [NONAME]
       1105      00120880 [NONAME]
       1106      00120910 [NONAME]
       1107      0011FDE0 [NONAME]
       1108      001200D0 [NONAME]
       1109      00120800 [NONAME]
       1110      001208A0 [NONAME]
       1115      0011FE60 [NONAME]
       1116      0011FF30 [NONAME]
       1117      0011FA80 [NONAME]
       1118      0011FB30 [NONAME]
       1119      000F82B0 [NONAME]

  Summary

       25000 .data
        1000 .didat
        3000 .mrdata
       12000 .pdata
       4C000 .rdata
        5000 .reloc
        1000 .rsrc
      156000 .text
```

## 例子代码

```lua xmake.lua
add_rules("mode.debug", "mode.release")

target("Meteor")
    set_kind("shared")
    add_files("src/main.c")
    set_filename("dbghelp.dll")
```

```c src/main.c
#include <stdio.h>
#include <windows.h>

// 导出dbghelp.dll中的函数，可以只导出你需要进行dll程序注入所用到的函数并不需要导出所有。之所以可以为空是因为dbghelp.dll里的导出函数并不是很重要（至少在生产环境下），如果你使用winhttp.dll之类的作为代理dll那么就需要写重定向了
__declspec(dllexport) void DbgHelpCreateUserDump() {}
__declspec(dllexport) void DbgHelpCreateUserDumpW() {}
__declspec(dllexport) void EnumDirTree() {}
__declspec(dllexport) void EnumDirTreeW() {}
__declspec(dllexport) void EnumerateLoadedModules() {}
__declspec(dllexport) void EnumerateLoadedModules64() {}
__declspec(dllexport) void EnumerateLoadedModulesEx() {}
__declspec(dllexport) void EnumerateLoadedModulesExW() {}
__declspec(dllexport) void EnumerateLoadedModulesW64() {}
__declspec(dllexport) void ExtensionApiVersion() {}
__declspec(dllexport) void FindDebugInfoFile() {}
__declspec(dllexport) void FindDebugInfoFileEx() {}
__declspec(dllexport) void FindDebugInfoFileExW() {}
__declspec(dllexport) void FindExecutableImage() {}
__declspec(dllexport) void FindExecutableImageEx() {}
__declspec(dllexport) void FindExecutableImageExW() {}
__declspec(dllexport) void FindFileInPath() {}
__declspec(dllexport) void FindFileInSearchPath() {}
__declspec(dllexport) void GetSymLoadError() {}
__declspec(dllexport) void GetTimestampForLoadedLibrary() {}
__declspec(dllexport) void ImageDirectoryEntryToData() {}
__declspec(dllexport) void ImageDirectoryEntryToDataEx() {}
__declspec(dllexport) void ImageNtHeader() {}
__declspec(dllexport) void ImageRvaToSection() {}
__declspec(dllexport) void ImageRvaToVa() {}
__declspec(dllexport) void ImagehlpApiVersion() {}
__declspec(dllexport) void ImagehlpApiVersionEx() {}
__declspec(dllexport) void MakeSureDirectoryPathExists() {}
__declspec(dllexport) void MiniDumpReadDumpStream() {}
__declspec(dllexport) void MiniDumpWriteDump() {}
__declspec(dllexport) void RangeMapAddPeImageSections() {}
__declspec(dllexport) void RangeMapCreate() {}
__declspec(dllexport) void RangeMapFree() {}
__declspec(dllexport) void RangeMapRead() {}
__declspec(dllexport) void RangeMapRemove() {}
__declspec(dllexport) void RangeMapWrite() {}
__declspec(dllexport) void RemoveInvalidModuleList() {}
__declspec(dllexport) void ReportSymbolLoadSummary() {}
__declspec(dllexport) void SearchTreeForFile() {}
__declspec(dllexport) void SearchTreeForFileW() {}
__declspec(dllexport) void SetCheckUserInterruptShared() {}
__declspec(dllexport) void SetSymLoadError() {}
__declspec(dllexport) void StackWalk() {}
__declspec(dllexport) void StackWalk64() {}
__declspec(dllexport) void StackWalkEx() {}
__declspec(dllexport) void SymAddSourceStream() {}
__declspec(dllexport) void SymAddSourceStreamA() {}
__declspec(dllexport) void SymAddSourceStreamW() {}
__declspec(dllexport) void SymAddSymbol() {}
__declspec(dllexport) void SymAddSymbolW() {}
__declspec(dllexport) void SymAddrIncludeInlineTrace() {}
__declspec(dllexport) void SymAllocDiaString() {}
__declspec(dllexport) void SymCleanup() {}
__declspec(dllexport) void SymCompareInlineTrace() {}
__declspec(dllexport) void SymDeleteSymbol() {}
__declspec(dllexport) void SymDeleteSymbolW() {}
__declspec(dllexport) void SymEnumLines() {}
__declspec(dllexport) void SymEnumLinesW() {}
__declspec(dllexport) void SymEnumProcesses() {}
__declspec(dllexport) void SymEnumSourceFileTokens() {}
__declspec(dllexport) void SymEnumSourceFiles() {}
__declspec(dllexport) void SymEnumSourceFilesW() {}
__declspec(dllexport) void SymEnumSourceLines() {}
__declspec(dllexport) void SymEnumSourceLinesW() {}
__declspec(dllexport) void SymEnumSym() {}
__declspec(dllexport) void SymEnumSymbols() {}
__declspec(dllexport) void SymEnumSymbolsEx() {}
__declspec(dllexport) void SymEnumSymbolsExW() {}
__declspec(dllexport) void SymEnumSymbolsForAddr() {}
__declspec(dllexport) void SymEnumSymbolsForAddrW() {}
__declspec(dllexport) void SymEnumSymbolsW() {}
__declspec(dllexport) void SymEnumTypes() {}
__declspec(dllexport) void SymEnumTypesByName() {}
__declspec(dllexport) void SymEnumTypesByNameW() {}
__declspec(dllexport) void SymEnumTypesW() {}
__declspec(dllexport) void SymEnumerateModules() {}
__declspec(dllexport) void SymEnumerateModules64() {}
__declspec(dllexport) void SymEnumerateModulesW64() {}
__declspec(dllexport) void SymEnumerateSymbols() {}
__declspec(dllexport) void SymEnumerateSymbols64() {}
__declspec(dllexport) void SymEnumerateSymbolsW() {}
__declspec(dllexport) void SymEnumerateSymbolsW64() {}
__declspec(dllexport) void SymFindDebugInfoFile() {}
__declspec(dllexport) void SymFindDebugInfoFileW() {}
__declspec(dllexport) void SymFindExecutableImage() {}
__declspec(dllexport) void SymFindExecutableImageW() {}
__declspec(dllexport) void SymFindFileInPath() {}
__declspec(dllexport) void SymFindFileInPathW() {}
__declspec(dllexport) void SymFreeDiaString() {}
__declspec(dllexport) void SymFromAddr() {}
__declspec(dllexport) void SymFromAddrW() {}
__declspec(dllexport) void SymFromIndex() {}
__declspec(dllexport) void SymFromIndexW() {}
__declspec(dllexport) void SymFromInlineContext() {}
__declspec(dllexport) void SymFromInlineContextW() {}
__declspec(dllexport) void SymFromName() {}
__declspec(dllexport) void SymFromNameW() {}
__declspec(dllexport) void SymFromToken() {}
__declspec(dllexport) void SymFromTokenW() {}
__declspec(dllexport) void SymFunctionTableAccess() {}
__declspec(dllexport) void SymFunctionTableAccess64() {}
__declspec(dllexport) void SymFunctionTableAccess64AccessRoutines() {}
__declspec(dllexport) void SymGetDiaSession() {}
__declspec(dllexport) void SymGetExtendedOption() {}
__declspec(dllexport) void SymGetFileLineOffsets64() {}
__declspec(dllexport) void SymGetHomeDirectory() {}
__declspec(dllexport) void SymGetHomeDirectoryW() {}
__declspec(dllexport) void SymGetLineFromAddr() {}
__declspec(dllexport) void SymGetLineFromAddr64() {}
__declspec(dllexport) void SymGetLineFromAddrEx() {}
__declspec(dllexport) void SymGetLineFromAddrW64() {}
__declspec(dllexport) void SymGetLineFromInlineContext() {}
__declspec(dllexport) void SymGetLineFromInlineContextW() {}
__declspec(dllexport) void SymGetLineFromName() {}
__declspec(dllexport) void SymGetLineFromName64() {}
__declspec(dllexport) void SymGetLineFromNameEx() {}
__declspec(dllexport) void SymGetLineFromNameW64() {}
__declspec(dllexport) void SymGetLineNext() {}
__declspec(dllexport) void SymGetLineNext64() {}
__declspec(dllexport) void SymGetLineNextEx() {}
__declspec(dllexport) void SymGetLineNextW64() {}
__declspec(dllexport) void SymGetLinePrev() {}
__declspec(dllexport) void SymGetLinePrev64() {}
__declspec(dllexport) void SymGetLinePrevEx() {}
__declspec(dllexport) void SymGetLinePrevW64() {}
__declspec(dllexport) void SymGetModuleBase() {}
__declspec(dllexport) void SymGetModuleBase64() {}
__declspec(dllexport) void SymGetModuleInfo() {}
__declspec(dllexport) void SymGetModuleInfo64() {}
__declspec(dllexport) void SymGetModuleInfoW() {}
__declspec(dllexport) void SymGetModuleInfoW64() {}
__declspec(dllexport) void SymGetOmapBlockBase() {}
__declspec(dllexport) void SymGetOmaps() {}
__declspec(dllexport) void SymGetOptions() {}
__declspec(dllexport) void SymGetScope() {}
__declspec(dllexport) void SymGetScopeW() {}
__declspec(dllexport) void SymGetSearchPath() {}
__declspec(dllexport) void SymGetSearchPathW() {}
__declspec(dllexport) void SymGetSourceFile() {}
__declspec(dllexport) void SymGetSourceFileChecksum() {}
__declspec(dllexport) void SymGetSourceFileChecksumW() {}
__declspec(dllexport) void SymGetSourceFileFromToken() {}
__declspec(dllexport) void SymGetSourceFileFromTokenW() {}
__declspec(dllexport) void SymGetSourceFileToken() {}
__declspec(dllexport) void SymGetSourceFileTokenW() {}
__declspec(dllexport) void SymGetSourceFileW() {}
__declspec(dllexport) void SymGetSourceVarFromToken() {}
__declspec(dllexport) void SymGetSourceVarFromTokenW() {}
__declspec(dllexport) void SymGetSymFromAddr() {}
__declspec(dllexport) void SymGetSymFromAddr64() {}
__declspec(dllexport) void SymGetSymFromName() {}
__declspec(dllexport) void SymGetSymFromName64() {}
__declspec(dllexport) void SymGetSymNext() {}
__declspec(dllexport) void SymGetSymNext64() {}
__declspec(dllexport) void SymGetSymPrev() {}
__declspec(dllexport) void SymGetSymPrev64() {}
__declspec(dllexport) void SymGetSymbolFile() {}
__declspec(dllexport) void SymGetSymbolFileW() {}
__declspec(dllexport) void SymGetTypeFromName() {}
__declspec(dllexport) void SymGetTypeFromNameW() {}
__declspec(dllexport) void SymGetTypeInfo() {}
__declspec(dllexport) void SymGetTypeInfoEx() {}
__declspec(dllexport) void SymGetUnwindInfo() {}
__declspec(dllexport) void SymInitialize() {}
__declspec(dllexport) void SymInitializeW() {}
__declspec(dllexport) void SymLoadModule() {}
__declspec(dllexport) void SymLoadModule64() {}
__declspec(dllexport) void SymLoadModuleEx() {}
__declspec(dllexport) void SymLoadModuleExW() {}
__declspec(dllexport) void SymMatchFileName() {}
__declspec(dllexport) void SymMatchFileNameW() {}
__declspec(dllexport) void SymMatchString() {}
__declspec(dllexport) void SymMatchStringA() {}
__declspec(dllexport) void SymMatchStringW() {}
__declspec(dllexport) void SymNext() {}
__declspec(dllexport) void SymNextW() {}
__declspec(dllexport) void SymPrev() {}
__declspec(dllexport) void SymPrevW() {}
__declspec(dllexport) void SymQueryInlineTrace() {}
__declspec(dllexport) void SymRefreshModuleList() {}
__declspec(dllexport) void SymRegisterCallback() {}
__declspec(dllexport) void SymRegisterCallback64() {}
__declspec(dllexport) void SymRegisterCallbackW64() {}
__declspec(dllexport) void SymRegisterFunctionEntryCallback() {}
__declspec(dllexport) void SymRegisterFunctionEntryCallback64() {}
__declspec(dllexport) void SymSearch() {}
__declspec(dllexport) void SymSearchW() {}
__declspec(dllexport) void SymSetContext() {}
__declspec(dllexport) void SymSetDiaSession() {}
__declspec(dllexport) void SymSetExtendedOption() {}
__declspec(dllexport) void SymSetHomeDirectory() {}
__declspec(dllexport) void SymSetHomeDirectoryW() {}
__declspec(dllexport) void SymSetOptions() {}
__declspec(dllexport) void SymSetParentWindow() {}
__declspec(dllexport) void SymSetScopeFromAddr() {}
__declspec(dllexport) void SymSetScopeFromIndex() {}
__declspec(dllexport) void SymSetScopeFromInlineContext() {}
__declspec(dllexport) void SymSetSearchPath() {}
__declspec(dllexport) void SymSetSearchPathW() {}
__declspec(dllexport) void SymSrvDeltaName() {}
__declspec(dllexport) void SymSrvDeltaNameW() {}
__declspec(dllexport) void SymSrvGetFileIndexInfo() {}
__declspec(dllexport) void SymSrvGetFileIndexInfoW() {}
__declspec(dllexport) void SymSrvGetFileIndexString() {}
__declspec(dllexport) void SymSrvGetFileIndexStringW() {}
__declspec(dllexport) void SymSrvGetFileIndexes() {}
__declspec(dllexport) void SymSrvGetFileIndexesW() {}
__declspec(dllexport) void SymSrvGetSupplement() {}
__declspec(dllexport) void SymSrvGetSupplementW() {}
__declspec(dllexport) void SymSrvIsStore() {}
__declspec(dllexport) void SymSrvIsStoreW() {}
__declspec(dllexport) void SymSrvStoreFile() {}
__declspec(dllexport) void SymSrvStoreFileW() {}
__declspec(dllexport) void SymSrvStoreSupplement() {}
__declspec(dllexport) void SymSrvStoreSupplementW() {}
__declspec(dllexport) void SymUnDName() {}
__declspec(dllexport) void SymUnDName64() {}
__declspec(dllexport) void SymUnloadModule() {}
__declspec(dllexport) void SymUnloadModule64() {}
__declspec(dllexport) void UnDecorateSymbolName() {}
__declspec(dllexport) void UnDecorateSymbolNameW() {}
__declspec(dllexport) void WinDbgExtensionDllInit() {}
__declspec(dllexport) void _EFN_DumpImage() {}
__declspec(dllexport) void block() {}
__declspec(dllexport) void chksym() {}
__declspec(dllexport) void dbghelp() {}
__declspec(dllexport) void dh() {}
__declspec(dllexport) void fptr() {}
__declspec(dllexport) void homedir() {}
__declspec(dllexport) void inlinedbg() {}
__declspec(dllexport) void itoldyouso() {}
__declspec(dllexport) void lmi() {}
__declspec(dllexport) void lminfo() {}
__declspec(dllexport) void omap() {}
__declspec(dllexport) void optdbgdump() {}
__declspec(dllexport) void optdbgdumpaddr() {}
__declspec(dllexport) void srcfiles() {}
__declspec(dllexport) void stack_force_ebp() {}
__declspec(dllexport) void stackdbg() {}
__declspec(dllexport) void sym() {}
__declspec(dllexport) void symsrv() {}

BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved) {
    if (ul_reason_for_call == DLL_PROCESS_ATTACH) { // 判断 DLL 是否被DLL_PROCESS_ATTACH(进程附加)
        AllocConsole(); // 这里调用 Windows API 打开一个控制台
    }
    return TRUE;
}

```
