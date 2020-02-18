import { Component, OnInit } from "@angular/core";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { screen } from "tns-core-modules/platform";
import { Item } from "./item";
import { ItemService } from "./item.service";
import { isIOS } from "tns-core-modules/platform";
import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";
import { Frame, View } from "tns-core-modules/ui/frame/frame";
import { Page } from "tns-core-modules/ui/page";
@Component({
    selector: "abc-sample",
    templateUrl: "./sample.component.html"
})
export class SampleComponent {
    constructor(private page: Page) {
        console.log(
            "width dip * height dip",
            screen.mainScreen.widthDIPs,
            screen.mainScreen.heightDIPs
        );
        console.log(
            "width px * height px",
            screen.mainScreen.widthPixels,
            screen.mainScreen.heightPixels
        );
        console.log("scale ", screen.mainScreen.scale);
    }
    loaded(args) {
        console.log(this.page);
        if (isIOS) {
            this.handleiOS(args);
        } else {
            this.handleAndroid(args);
        }
    }

    onLayout(args) {
        console.log(Frame.topmost().page, this.page);
    }

    handleiOS(args) {
        const grid = args.object;
        const baseLayerPath = UIBezierPath.bezierPathWithRect(
            CGRectMake(
                0,
                0,
                screen.mainScreen.widthDIPs,
                screen.mainScreen.heightDIPs
            )
        );
        const cutout = this._createCutOut("circle", 10, 200, 100, 100);

        baseLayerPath.appendPath(cutout);
        baseLayerPath.usesEvenOddFillRule = true;

        let maskLayer = CAShapeLayer.layer();
        maskLayer.path = baseLayerPath.CGPath;
        maskLayer.fillRule = kCAFillRuleEvenOdd;
        maskLayer.fillColor = UIColor.colorWithRedGreenBlueAlpha(
            0,
            0,
            0,
            0.7
        ).CGColor;
        //fillLayer.opacity = 0.4
        grid.ios.layer.addSublayer(maskLayer);
        setTimeout(() => {
            this._moveCircle(
                maskLayer,
                2,
                this._createCutOut(
                    "circle",
                    screen.mainScreen.widthDIPs / 2 - 50,
                    25,
                    100,
                    100
                )
            );

            setTimeout(() => {
                this._moveCircle(
                    maskLayer,
                    1,
                    this._createCutOut(
                        "circle",
                        screen.mainScreen.widthDIPs / 2 + 100,
                        300,
                        85,
                        85
                    )
                );
                setTimeout(() => {
                    this._moveCircle(
                        maskLayer,
                        0.5,
                        this._createCutOut(
                            "rect",
                            screen.mainScreen.widthDIPs / 2 - 100,
                            450,
                            55,
                            55
                        )
                    );
                    setTimeout(() => {
                        this._moveCircle(
                            maskLayer,
                            0.2,
                            this._createCutOut(
                                "circle",
                                screen.mainScreen.widthDIPs / 2 - 200,
                                250,
                                125,
                                125
                            )
                        );
                    }, 2500);
                }, 2500);
            }, 3000);
        }, 1000);
    }

    private _viewId: number;

    handleAndroid(args) {
        if (this._viewId) return;
        this._viewId = android.view.View.generateViewId();
        const grid = args.object;
        const shapeView = (android as any).view.View.extend({
            _path: null,
            _backgroundColor: null,
            paint: null,
            trianglePath: null,
            get backgroundColor() {
                return this._backgroundColor;
            },
            set backgroundColor(color) {
                this._backgroundColor = new android.graphics.Paint();
                if (color instanceof Color) {
                    this._backgroundColor.setColor(color.android);
                } else {
                    this._backgroundColor.setColor(new Color(color).android);
                }
                this.invalidate();
            },
            get path() {
                return this._path;
            },
            set path(value) {
                this._path = value;
                this.invalidate();
            },
            init: function(context) {
                this.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
                const paint = new android.graphics.Paint();
                paint.setColor(android.graphics.Color.TRANSPARENT);
                paint.setXfermode(
                    new android.graphics.PorterDuffXfermode(
                        android.graphics.PorterDuff.Mode.CLEAR
                    )
                );
                paint.setAntiAlias(true);
                this.paint = paint;
                this.trianglePath = new android.graphics.Path();
            },
            onDraw: function(canvas: android.graphics.Canvas) {
                if (this.backgroundColor) {
                    canvas.drawRect(
                        this.getX(),
                        this.getY(),
                        this.getWidth(),
                        this.getHeight(),
                        this.backgroundColor
                    );
                }
                if (this.path) {
                    const { type, x, y, width, height } = this.path;
                    switch (type) {
                        case "circle":
                            let radius = 0;
                            if (width > height) {
                                radius = height / 2;
                            } else {
                                radius = width / 2;
                            }
                            const rectf = new android.graphics.RectF(
                                x,
                                y,
                                x + width,
                                y + height
                            );
                            canvas.drawRoundRect(
                                rectf,
                                radius,
                                radius,
                                this.paint
                            );
                            break;
                        case "rect":
                            canvas.drawRect(
                                x,
                                y,
                                x + width,
                                y + height,
                                this.paint
                            );
                            break;
                        case "triangle":
                            this.trianglePath.reset();
                            this.trianglePath.moveTo(x, y + height);
                            this.trianglePath.lineTo(x + width / 2, y);
                            this.trianglePath.lineTo(x + width, y + height);
                            this.trianglePath.lineTo(x, y + height);
                            canvas.drawPath(this.trianglePath, this.paint);
                            break;
                    }
                }
            },
            count: 0,
            moveShape: function(duration, path) {
                const {
                    x: previous_x,
                    y: previous_y,
                    width: previous_width,
                    height: previous_height
                } = this.path;
                const {
                    x: new_x,
                    y: new_y,
                    width: new_width,
                    height: new_height
                } = path;

                const animator = new android.animation.ValueAnimator();
                const X_PROP = "move_x";
                const Y_PROP = "move_y";
                const WIDTH_PROP = "move_width";
                const HEIGHT_PROP = "move_height";
                const x = android.animation.PropertyValuesHolder.ofFloat(
                    X_PROP,
                    [previous_x, new_x]
                );
                const y = android.animation.PropertyValuesHolder.ofFloat(
                    Y_PROP,
                    [previous_y, new_y]
                );
                const width = android.animation.PropertyValuesHolder.ofFloat(
                    WIDTH_PROP,
                    [previous_width, new_width]
                );
                const height = android.animation.PropertyValuesHolder.ofFloat(
                    HEIGHT_PROP,
                    [previous_height, new_height]
                );
                console.log(x);
                console.log(y);
                console.log(width);
                console.log(height);
                animator.setInterpolator(
                    new android.view.animation.DecelerateInterpolator(1)
                );
                animator.setDuration(duration * 1000);
                animator.setValues([x, y, width, height]);
                const ref = new WeakRef(this);
                animator.addUpdateListener(
                    new android.animation.ValueAnimator.AnimatorUpdateListener({
                        onAnimationUpdate(value) {
                            const update_x = value
                                .getAnimatedValue(X_PROP)
                                .floatValue();
                            const update_y = value
                                .getAnimatedValue(Y_PROP)
                                .floatValue();
                            const update_width = value
                                .getAnimatedValue(WIDTH_PROP)
                                .floatValue();
                            const update_height = value
                                .getAnimatedValue(HEIGHT_PROP)
                                .floatValue();
                            const owner = ref.get();
                            if (owner) {
                                owner.path = {
                                    ...path,
                                    x: update_x,
                                    y: update_y,
                                    width: update_width,
                                    height: update_height
                                };
                            }
                        }
                    })
                );
                animator.start();
            }
        });
        const maskLayer = new shapeView(app.android.context);
        maskLayer.setId(this._viewId);
        maskLayer.backgroundColor = new Color(255 * 0.7, 0, 0, 0);
        maskLayer.path = this._createCutOut("circle", 75, 200, 100, 100);
        grid.android.addView(maskLayer);

        setTimeout(() => {
            this._moveCircle(
                maskLayer,
                2,
                this._createCutOut("circle", 50, 10, 100, 100)
            );
            const screenWidth = screen.mainScreen.widthDIPs;
            setTimeout(() => {
                this._moveCircle(
                    maskLayer,
                    1,
                    this._createCutOut(
                        "circle",
                        screenWidth - screenWidth * 0.3,
                        300,
                        85,
                        85
                    )
                );
                setTimeout(() => {
                    this._moveCircle(
                        maskLayer,
                        0.5,
                        this._createCutOut(
                            "rect",
                            screenWidth - screenWidth * 0.2,
                            450,
                            55,
                            55
                        )
                    );
                    setTimeout(() => {
                        this._moveCircle(
                            maskLayer,
                            0.5,
                            this._createCutOut(
                                "circle",
                                screenWidth * 0.2,
                                250,
                                125,
                                125
                            )
                        );
                    }, 2500);
                }, 2500);
            }, 3000);
        }, 1000);
    }

    private _moveCircle(maskLayer: any, duration: number, cutout: any) {
        if (isIOS) {
            const animation = CABasicAnimation.animationWithKeyPath("path");
            animation.duration = duration;

            const baseLayerPath = UIBezierPath.bezierPathWithRect(
                CGRectMake(
                    0,
                    0,
                    screen.mainScreen.widthDIPs,
                    screen.mainScreen.heightDIPs
                )
            );
            // cut a hole in it with a new shape
            baseLayerPath.appendPath(cutout);
            baseLayerPath.usesEvenOddFillRule = true;

            animation.toValue = baseLayerPath.CGPath;
            animation.timingFunction = CAMediaTimingFunction.functionWithName(
                kCAMediaTimingFunctionEaseOut
            );
            animation.fillMode = kCAFillModeForwards;
            animation.removedOnCompletion = false;
            maskLayer.addAnimationForKey(animation, null);
        } else {
            maskLayer.moveShape(duration, cutout);
            /* const baseLayerPath = new android.graphics.Path();
             baseLayerPath.addRect(0,0,screen.mainScreen.widthPixels,screen.mainScreen.heightPixels, android.graphics.Path.Direction.CW);

            // cut a hole in it with a new shape
            baseLayerPath.addPath(cutout);
           baseLayerPath.setFillType(android.graphics.Path.FillType.EVEN_ODD);

            const animation: android.animation.ValueAnimator = new (android as any).animation.ObjectAnimator.ofFloat(maskLayer.getChildAt(0),"x","y", baseLayerPath);
            animation.setDuration(duration * 1000);
            animation.start();
            */
            // maskLayer.drawCutout(duration, cutout)
            /*animation.timingFunction = CAMediaTimingFunction.functionWithName(
                kCAMediaTimingFunctionEaseOut
            );*/
            // animation.fillMode = kCAFillModeForwards;
            // animation.removedOnCompletion = false;
            // maskLayer.addAnimationForKey(animation, null);
        }
    }

    private _createCutOut(
        type: "circle" | "rect" | "triangle",
        x: number,
        y: number,
        width: number,
        height: number
    ): any {
        if (isIOS) {
            switch (type) {
                case "circle":
                    return UIBezierPath.bezierPathWithOvalInRect(
                        CGRectMake(x, y, width, height)
                    );
                case "rect":
                    return UIBezierPath.bezierPathWithRect(
                        CGRectMake(x, y, width, height)
                    );
            }
        }
        const scale = screen.mainScreen.scale;
        x = x * scale;
        y = y * scale;
        width = width * scale;
        height = height * scale;
        return {
            type,
            x,
            y,
            width,
            height
        };
    }
}
