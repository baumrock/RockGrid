## [1.0.1](https://github.com/baumrock/RockGrid/compare/v1.0.0...v1.0.1) (2024-10-03)


### Bug Fixes

* reset cache if paths changed ([a87434d](https://github.com/baumrock/RockGrid/commit/a87434ddc2d5e4f45d6b708415ba94c1a432485f))

## [1.0.0](https://github.com/baumrock/RockGrid/compare/v0.4.0...v1.0.0) (2024-10-01)


### ⚠ BREAKING CHANGES

* bump version to 1.0.0

### Features

* bump version to 1.0.0 ([a40abc6](https://github.com/baumrock/RockGrid/commit/a40abc6f57e3739570fbbacdf753e6fb3fa252ac))

## [0.4.0](https://github.com/baumrock/RockGrid/compare/v0.2.0...v0.4.0) (2024-10-01)


### Features

* add basic sse support ([f410516](https://github.com/baumrock/RockGrid/commit/f410516bf2b1fc9b846ed0f1c9f72e2d47fd160f))
* add basic sse support ([49b06b6](https://github.com/baumrock/RockGrid/commit/49b06b603fcb609e15f99e30ea67ef62c0f0bada))
* add buttons and fix issue with afterInit ([88b7d4f](https://github.com/baumrock/RockGrid/commit/88b7d4f0a3482001f83e6bb094137761375c0ddd))
* add copy to clipboard button ([d254078](https://github.com/baumrock/RockGrid/commit/d25407859995dd12cc97b79c9ad8b4004c96016e))
* add debug checkbox ([4fb2247](https://github.com/baumrock/RockGrid/commit/4fb224791e418614a75f9ffd7403d48af20fc238))
* add interval based sse ui update ([e4bb4aa](https://github.com/baumrock/RockGrid/commit/e4bb4aaf04a4f959ad0c0e6bbc9a9596a621d3b9))
* add js stubfile ([74bfba2](https://github.com/baumrock/RockGrid/commit/74bfba2d7304dcd0462292b0a3b35c14a77ec85e))
* add mathJS for calc editor ([de4ae6c](https://github.com/baumrock/RockGrid/commit/de4ae6c41e3556e0423ace486d7dc6bc1cdf8c99))
* add name to grid ([32d4b74](https://github.com/baumrock/RockGrid/commit/32d4b74cdef8e170054ca2c34d41a9f8630fe14e))
* add new grid.sleep() and RockGrid.on(...) syntax ([ba8e884](https://github.com/baumrock/RockGrid/commit/ba8e884811743fbfd12a7ada52835d822de12824))
* add sse backend ([ad07240](https://github.com/baumrock/RockGrid/commit/ad07240fb2fee9aaad9461d0f438d37fbdc51c1a))
* add style as less ([5baf85a](https://github.com/baumrock/RockGrid/commit/5baf85a963f4cc9eabb31b05e598866ea884e9cd))
* add support for sending data from php to js via getJsVars() ([1c1f8d1](https://github.com/baumrock/RockGrid/commit/1c1f8d1e31e7791799fa9954248bd43be285bb47))
* debug process working ([25ad8a2](https://github.com/baumrock/RockGrid/commit/25ad8a29ddf421d06eb5b575c03ff8852400c91c))
* improve cache busting ([508f100](https://github.com/baumrock/RockGrid/commit/508f100b513c608f9a61944a24ff52b0ab32dbcb))
* improve calc editor ([d79df76](https://github.com/baumrock/RockGrid/commit/d79df7655c1d979eaa79622c7662144512be7923))
* improve modal feature ([c746cff](https://github.com/baumrock/RockGrid/commit/c746cff76e7a87c322e7e2696c1788a98d6029fa))
* load js from dedicated file and support ajax fields ([772edca](https://github.com/baumrock/RockGrid/commit/772edcad387435f4038cc57ece3f426af7fc7c82))
* loading grids works, adding css works ([476a020](https://github.com/baumrock/RockGrid/commit/476a020bbd574bb970f3c2613ae5fdadc7a62c9d))
* make itemCallback optional ([17a856a](https://github.com/baumrock/RockGrid/commit/17a856ae89c8033fd1214e41b4782a800c0da039))
* new syntax for setting up a grid ([fd1a927](https://github.com/baumrock/RockGrid/commit/fd1a927b1724de814e5aef2cedf367e686f396f0))
* read debug mode from config ([4004566](https://github.com/baumrock/RockGrid/commit/4004566fa7ed21ab7a9b6adcdf78aef107921aa1))
* refactor + support buttons + formatters + modals ([27c889b](https://github.com/baumrock/RockGrid/commit/27c889b0933eca2190f489bf543534e1748955de))
* refactor step 1 ([d53ec67](https://github.com/baumrock/RockGrid/commit/d53ec67071023c09dcc9bb0a52b9e04b8260126e))
* reset for rewrite ([57d4542](https://github.com/baumrock/RockGrid/commit/57d4542fd702b147421a14491de910a357180950))
* restore deleted version ([315a2b8](https://github.com/baumrock/RockGrid/commit/315a2b80166e16f9be9c9953fc869ae28df02028))
* ui tweaks ([69cf7cc](https://github.com/baumrock/RockGrid/commit/69cf7cc82ae5b59af1818f751ea485892dfe0b31))
* update textarea based on selection ([b0614c0](https://github.com/baumrock/RockGrid/commit/b0614c07387c909b11bca137a276bb273e114e88))
* wakeup with selected rows ([44d0e4d](https://github.com/baumrock/RockGrid/commit/44d0e4d053543cb91350c2c7c533d8452ebdb1a1))


### Bug Fixes

* add missing viewable check in ajax response ([19d3617](https://github.com/baumrock/RockGrid/commit/19d3617909c7d72ab01b8977321047af3f17821d))
* clear only header filters ([49f476e](https://github.com/baumrock/RockGrid/commit/49f476e628c5a93821e1f394b0618a188375bd3a))
* dispatch init instantly and not on dom ready ([10f2910](https://github.com/baumrock/RockGrid/commit/10f291013d9423bbc4e98b8b66316b8b6b9e3d2d))
* non-ajax field loading bug ([3f091f6](https://github.com/baumrock/RockGrid/commit/3f091f67b157708b73ac16af4be0cc00a55d15c0))
* prevent error when params not set ([8d13f80](https://github.com/baumrock/RockGrid/commit/8d13f804d894af36727a8aa5469fb8b91fe77934))
* prevent statechange on wakeup ([bcff350](https://github.com/baumrock/RockGrid/commit/bcff350954eb65d042a75866b9f3700c03d6df65))
* rename hash to safe/raw name ([e12d858](https://github.com/baumrock/RockGrid/commit/e12d858ce17621855737026927e7c0647e427ee2))
* selected pages returned an empty array for guests ([d8d12e9](https://github.com/baumrock/RockGrid/commit/d8d12e9bc83d576b8f9fe55292dcfcd24cc5bb71))
* wakeup must be last ([b6e0d4e](https://github.com/baumrock/RockGrid/commit/b6e0d4e8119456070cfc87638ecb69d5a4c93cfa))
* wrong button visibility for remove filter ([1a04766](https://github.com/baumrock/RockGrid/commit/1a04766d4ea6df5a1763e78d66e809246a62a59b))

## [0.2.0](https://github.com/baumrock/RockGrid/compare/v0.1.0...v0.2.0) (2024-02-04)


### Features

* add prependMarkup / appendMarkup for buttons ([18a4bd1](https://github.com/baumrock/RockGrid/commit/18a4bd19de2486c2548602a6add6d2f8ea35febd))

## [0.1.0](https://github.com/baumrock/RockGrid/compare/c9111c285aa0016fb80a1004435b563a65e504b8...v0.1.0) (2024-01-03)


### Features

* add feature to hide grids from the menu ([cf6d9af](https://github.com/baumrock/RockGrid/commit/cf6d9af6e4a1d365360b2b961c91c80174345074))
* add options param for findRaw() ([79cd133](https://github.com/baumrock/RockGrid/commit/79cd1338d2a9376ab7fefbdc1e959799f4f117c8))
* add rockgrid-init event to attach event listeners to ([46172c3](https://github.com/baumrock/RockGrid/commit/46172c34ef97a39cae23e74dbe171c838200c063))
* add view + edit url hooks via pageID ([f4d9a85](https://github.com/baumrock/RockGrid/commit/f4d9a855000f9b7c2b86b857e2491550807829c6))
* improve customizing/hooking layout buttons ([334a4ec](https://github.com/baumrock/RockGrid/commit/334a4ecf0c40f02f231a6461cf26c903e77133b9))
* move process page to setup tab ([ec6a572](https://github.com/baumrock/RockGrid/commit/ec6a572f3aabd6c5b76c2624ddf2e5fdae0f16c1))
* redirect to create new grid ([c741b4e](https://github.com/baumrock/RockGrid/commit/c741b4eb3d4eee99b28f4094c5c479555ce2069d))
* remove unused sourcefiles and upgrade tabulator ([cb3aa8a](https://github.com/baumrock/RockGrid/commit/cb3aa8a618c8199c8d608340296e160e7823a9e2))
* update docs ([f87b09b](https://github.com/baumrock/RockGrid/commit/f87b09bd32009548a199661c3b8ab80e56cd15a4))


### Bug Fixes

* debugger asset urls ([c295e34](https://github.com/baumrock/RockGrid/commit/c295e34483b746dee305a85a1125c7c80e650190))
* define property "rg" to prevent php8.2 error ([039975c](https://github.com/baumrock/RockGrid/commit/039975c2b2d376462265966a5b319fa3421bfda1))
* fix trash not working due to missing endpoint urls ([66b2570](https://github.com/baumrock/RockGrid/commit/66b25709e45b18e3c3145c7117880c4d802e9224))
* rockgrid not working in sub-folder installations ([c9111c2](https://github.com/baumrock/RockGrid/commit/c9111c285aa0016fb80a1004435b563a65e504b8))

