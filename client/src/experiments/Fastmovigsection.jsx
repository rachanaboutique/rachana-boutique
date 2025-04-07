  {/*       <section className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Watch And Buy</h2>
          </div>
          <div className="flex h-full w-full items-center justify-center px-2">
            <div className="container mx-auto px-4">
              <ul
                ref={wrapperRef}
                className="group flex flex-col gap-3 md:h-[640px] md:flex-row md:gap-[1.5%]"
              >
                {productList &&
                  productList.length > 0 &&
                  productList
                    .filter((productItem) => productItem?.isWatchAndBuy)
                    .map((productItem, index) => (
                      <motion.li
                        key={productItem._id}
                        ref={ref}
                        onClick={() => setActiveItem(index)}
                        aria-current={activeItem === index}
                        initial={{ x: -100, opacity: 0 }}
                        animate={{
                          x: inView ? 0 : -100,
                          opacity: inView ? 1 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 25,
                        }}
                        className={classNames(
                          "relative cursor-pointer md:w-[16%] md:first:w-[16%] md:last:w-[16%] md:[&[aria-current='true']]:w-[40%]",
                          "md:[transition:width_var(--transition,200ms_ease-in)]",
                          "md:before-block before:absolute before:bottom-0 before:left-[-10px] before:right-[-10px] before:top-0 before:hidden before:bg-white",
                          "md:[&:not(:hover),&:not(:first),&:not(:last)]:group-hover:w-[14%] md:hover:w-[20%]",
                          "first:pointer-events-auto last:pointer-events-auto",
                          "md:[&_img]:opacity-100"
                        )}
                      >
                        <FastMovingCard
                          item={productItem}
                          index={index}
                          activeItem={activeItem}
                          handleAddtoCart={handleAddtoCart}
                        />
                      </motion.li>
                    ))}
              </ul>
            </div>
          </div>
        </section> */}