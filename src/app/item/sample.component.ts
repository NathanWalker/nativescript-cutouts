import { Component, OnInit } from "@angular/core";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { screen } from "tns-core-modules/platform";
import { Item } from "./item";
import { ItemService } from "./item.service";

@Component({
    selector: "abc-sample",
    templateUrl: "./sample.component.html"
})
export class SampleComponent {

    loaded(args) {
        const grid = args.object;
        let pathBigRect = UIBezierPath.bezierPathWithRect(
            CGRectMake(0, 0, 450, 850)
        );
        let pathSmallRect = this._createCutOut("circle", 10, 200, 100, 100);

        pathBigRect.appendPath(pathSmallRect);
        pathBigRect.usesEvenOddFillRule = true;

        let maskLayer = CAShapeLayer.layer();
        maskLayer.path = pathBigRect.CGPath;
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

    private _moveCircle(
        maskLayer: CAShapeLayer,
        duration: number,
        cutout: UIBezierPath
    ) {
        let animation = CABasicAnimation.animationWithKeyPath("path");
        animation.duration = duration;

        // Your new shape here
        let pathBigRect = UIBezierPath.bezierPathWithRect(
            CGRectMake(0, 0, 450, 850)
        );

        pathBigRect.appendPath(cutout);
        pathBigRect.usesEvenOddFillRule = true;

        animation.toValue = pathBigRect.CGPath;
        animation.timingFunction = CAMediaTimingFunction.functionWithName(
            kCAMediaTimingFunctionEaseOut
        );
        animation.fillMode = kCAFillModeForwards;
        animation.removedOnCompletion = false;
        maskLayer.addAnimationForKey(animation, null);
    }

    private _createCutOut(
        type: "circle" | "rect",
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        switch (type) {
            case "circle":
                return UIBezierPath.bezierPathWithOvalInRect(
                    CGRectMake(x, y, width, height)
                );
                break;
            case "rect":
                return UIBezierPath.bezierPathWithRect(
                    CGRectMake(x, y, width, height)
                );
                break;
        }
    }
}
